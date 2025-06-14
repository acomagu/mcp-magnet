use anyhow::anyhow;
use openpgp::{
    Cert,
    parse::{
        Parse,
        stream::{DetachedVerifierBuilder, MessageStructure, VerificationHelper},
    },
    policy::StandardPolicy, // to_vec / serialize
};
use sequoia_openpgp as openpgp;
use ssh_key::{PublicKey, SshSig};
use wasm_bindgen::JsValue;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn verify(json: &str, sig: &str, key: &str) -> Result<bool, JsValue> {
    verify_detailed(json, sig, key)
        .map(|_| true)
        .map_err(|e| JsValue::from_str(&e))
}

pub fn verify_detailed(json: &str, sig: &str, key: &str) -> Result<(), String> {
    if sig.starts_with("-----BEGIN PGP SIGNATURE-----") {
        verify_pgp(json.as_bytes(), sig, key)
            .map(|_| ())
            .map_err(|e| e.to_string())
    } else if sig.starts_with("-----BEGIN SSH SIGNATURE-----") {
        verify_ssh(json.as_bytes(), sig, key)
            .map(|_| ())
            .map_err(|e| e.to_string())
    } else {
        Err("unrecognized header".into())
    }
}

/*── PGP ───────────────────────────*/
fn verify_pgp(data: &[u8], sig_arm: &str, key_arm: &str) -> openpgp::Result<bool> {
    let certs = pgp_certs(key_arm)?;

    // /* Armor → raw bytes  */
    // let mut r = Reader::from_bytes(
    //     sig_arm.as_bytes(),
    //     ReaderMode::Tolerant(Some(Kind::Signature)), // ★ 修正
    // );
    // let mut raw = Vec::new();
    // r.read_to_end(&mut raw)?;
    // println!(
    //     "★ raw.len = {}, head = {:02X?}",
    //     raw.len(),
    //     &raw[..8.min(raw.len())]
    // );
    //
    // /* raw → Signature パケット */
    // let sig_pkt = match Signature::from_bytes(&raw[2..]) {
    //     Ok(pkt) => pkt,
    //     Err(e) => {
    //         println!("‼️  Signature::from_bytes error: {e:?}");
    //         return Err(e);
    //     }
    // };
    // println!("★ sig.version = {}", sig_pkt.version());
    //
    // let sig_full = Packet::Signature(sig_pkt.clone()).to_vec()?; // CTB+len+body
    // let sig = Signature::from_bytes(sig_arm)?;
    // for cert in certs {
    //     cert.primary_key().key().verify(sig, )

    let policy = StandardPolicy::new();
    let mut errors = Vec::new();

    for cert in certs {
        match DetachedVerifierBuilder::from_bytes(sig_arm)
            .and_then(|b| b.with_policy(&policy, None, Helper { cert: &cert }))
            .and_then(|mut v| v.verify_bytes(data))
        {
            Ok(_) => return Ok(true),
            Err(e) => errors.push(e),
        }
    }

    // すべての cert で検証が失敗した場合、エラーを集約して返す
    let combined_error = errors
        .into_iter()
        .map(|e| format!("{:?}", e))
        .collect::<Vec<_>>()
        .join("\n");

    Err(anyhow!(
        "Signature verification failed:\n{}",
        combined_error
    ))
}

fn pgp_certs(key_arm: &str) -> openpgp::Result<Vec<Cert>> {
    let mut certs = Vec::new();
    let ppr = openpgp::parse::PacketParser::from_bytes(key_arm.as_bytes())?;
    for cert_result in openpgp::cert::CertParser::from(ppr) {
        let cert = cert_result?;
        certs.push(cert);
    }
    Ok(certs)
}

// fn pgp_arming_sig(

/* Helper そのまま */
struct Helper<'a> {
    cert: &'a Cert,
}
impl<'a> VerificationHelper for Helper<'a> {
    fn get_certs(&mut self, _: &[openpgp::KeyHandle]) -> openpgp::Result<Vec<Cert>> {
        Ok(vec![self.cert.clone()])
    }
    fn check(&mut self, _: MessageStructure) -> openpgp::Result<()> {
        Ok(())
    }
}

/*──────── SSH ────────*/
fn verify_ssh(data: &[u8], sig_pem: &str, key_txt: &str) -> Result<bool, ssh_key::Error> {
    let pk: PublicKey = key_txt.parse()?;
    let sig: SshSig = sig_pem.parse()?;
    pk.verify("file", data, &sig)?;
    Ok(true)
}

/*──────── Tests ────────*/
#[cfg(test)]
mod tests {
    use super::*;
    use openpgp::{
        armor::{Kind, Writer},
        cert::prelude::*,
        crypto::{KeyPair, Signer},
        serialize::Marshal,
        types::HashAlgorithm,
    };
    use ssh_key::rand_core::OsRng;
    use ssh_key::{Algorithm, HashAlg, LineEnding, PrivateKey};

    const JSON: &str = r#"{"ok":true}"#;

    // WASM specific tests
    #[cfg(target_arch = "wasm32")]
    mod wasm_tests {
        use super::*;
        use wasm_bindgen_test::*;

        #[wasm_bindgen_test]
        fn ssh_roundtrip_wasm() {
            let mut rng = OsRng;
            let sk = PrivateKey::random(&mut rng, Algorithm::Ed25519).unwrap();
            let pk_text = sk.public_key().to_openssh().unwrap();
            let sig_pem = sk
                .sign("file", HashAlg::Sha256, JSON.as_bytes())
                .unwrap()
                .to_pem(LineEnding::LF)
                .unwrap();

            assert!(verify(JSON, &sig_pem, &pk_text).unwrap());
        }

        #[wasm_bindgen_test]
        fn pgp_roundtrip_wasm() {
            // Create a temporary certificate
            let (cert, _) = CertBuilder::general_purpose(Some("wasm@example.com"))
                .generate()
                .unwrap();

            // Create key armor
            let key_arm = {
                let mut w = Writer::new(Vec::new(), Kind::PublicKey).unwrap();
                cert.serialize(&mut w).unwrap();
                String::from_utf8(w.finalize().unwrap()).unwrap()
            };

            // Create detached signature
            let mut kp: KeyPair = cert
                .primary_key()
                .key()
                .clone()
                .parts_into_secret()
                .unwrap()
                .into_keypair()
                .unwrap();
            let sig = SignatureBuilder::new(SignatureType::Binary)
                .set_hash_algo(HashAlgorithm::SHA256)
                .sign_message(&mut kp, JSON.as_bytes())
                .unwrap();

            // Create signature armor
            let sig_arm = {
                let mut w = Writer::new(Vec::new(), Kind::Signature).unwrap();
                let full_packet = Packet::Signature(sig.clone()).to_vec().unwrap();
                w.write_all(&full_packet).unwrap();
                String::from_utf8(w.finalize().unwrap()).unwrap()
            };

            assert!(verify(JSON, &sig_arm, &key_arm).unwrap());
        }
    }

    #[test]
    fn ssh_roundtrip() {
        let mut rng = OsRng;
        let sk = PrivateKey::random(&mut rng, Algorithm::Ed25519).unwrap();
        let pk = sk.public_key().to_openssh().unwrap();
        let sig = sk
            .sign("file", HashAlg::Sha256, JSON.as_bytes())
            .unwrap()
            .to_pem(LineEnding::LF)
            .unwrap();
        assert!(verify(JSON, &sig, &pk).unwrap());
    }

    #[test]
    fn pgp_roundtrip() {
        // 一時鍵
        let (cert, _) = CertBuilder::general_purpose(Some("tester"))
            .generate()
            .unwrap();

        // Detached 署名
        let mut kp: KeyPair = cert
            .primary_key()
            .key()
            .clone()
            .parts_into_secret()
            .unwrap()
            .into_keypair()
            .unwrap();
        let sig = SignatureBuilder::new(SignatureType::Binary)
            .set_hash_algo(HashAlgorithm::SHA256)
            .sign_message(&mut kp, JSON.as_bytes())
            .unwrap();

        // 署名 Armor
        let sig_arm = {
            let mut w = Writer::new(Vec::new(), Kind::Signature).unwrap();
            // CTB+length+Version4+… を含む完全パケットを書き込む
            let full_packet = Packet::Signature(sig.clone()).to_vec().unwrap();
            w.write_all(&full_packet).unwrap();
            String::from_utf8(w.finalize().unwrap()).unwrap()
        };

        // 公開鍵 Armor
        let key_arm = {
            let mut w = Writer::new(Vec::new(), Kind::PublicKey).unwrap();
            cert.serialize(&mut w).unwrap();
            String::from_utf8(w.finalize().unwrap()).unwrap()
        };

        // Log inputs to verify function
        println!("=== PGP Roundtrip Test Inputs ===");
        println!("JSON input: {}", JSON);
        println!(
            "Signature (first 50 chars): {}",
            &sig_arm[..50.min(sig_arm.len())]
        );
        println!(
            "Signature (last 50 chars): {}",
            &sig_arm[sig_arm.len() - 50.min(sig_arm.len())..]
        );
        println!(
            "Key (first 50 chars): {}",
            &key_arm[..50.min(key_arm.len())]
        );
        println!(
            "Key (last 50 chars): {}",
            &key_arm[key_arm.len() - 50.min(key_arm.len())..]
        );
        println!("===============================");

        verify_detailed(JSON, &sig_arm, &key_arm).unwrap();
    }
}
