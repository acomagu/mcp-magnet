// Define the commands module
pub mod commands;

use urlencoding::encode; // Import encode function

// 新しいウィンドウでディープリンクダイアログを表示するコマンド
#[tauri::command]
// Removed optional target and project_path parameters
async fn open_deeplink_dialog(
    app_handle: tauri::AppHandle,
    deeplink_url: &str,
) -> Result<(), String> {
    // URLエンコードされたURLを構築
    let encoded_url = encode(deeplink_url);
    let url = format!("dialog-window.html?url={}", encoded_url);

    // 新しいウィンドウを作成
    tauri::WebviewWindowBuilder::new(
        &app_handle,
        "deep_link_dialog",
        tauri::WebviewUrl::App(url.into()),
    )
    .title("MCP Magnet")
    .inner_size(600.0, 800.0)
    .resizable(true)
    .build()
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn sig_verify(json: &str, sig: &str, key: &str) -> Result<(), String> {
    mcp_magnet_sig_verify::verify_detailed(json, sig, key)
}

use tauri_plugin_deep_link::DeepLinkExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_shell::init());

    builder
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                if let Err(e) = tauri::WebviewWindowBuilder::new(
                    app.handle(),
                    "deeplink_tester",
                    tauri::WebviewUrl::App("deeplink-tester.html".into()),
                )
                .title("DeepLink Tester")
                .inner_size(800.0, 600.0)
                .resizable(true)
                .build()
                {
                    eprintln!("Failed to open DeepLink Tester window: {}", e);
                }

                // Open the Shell Command Example window in debug mode
                if let Err(e) = tauri::WebviewWindowBuilder::new(
                    app.handle(),
                    "shell_command_example",
                    tauri::WebviewUrl::App("shell-command-example.html".into()),
                )
                .title("Shell Command Example")
                .inner_size(800.0, 600.0)
                .resizable(true)
                .build()
                {
                    eprintln!("Failed to open Shell Command Example window: {}", e);
                }
            }

            // 開発モードで deep link を登録（Linux と Windows のみ）
            #[cfg(any(target_os = "linux", all(debug_assertions, windows)))]
            {
                // エラーハンドリングを追加して、失敗しても続行できるようにします
                if let Err(e) = app.deep_link().register("mcp-magnet") {
                    eprintln!("Failed to register deep link scheme: {}", e);
                    // エラーを返さず、処理を続行します
                }
            }

            // ── 1. 起動トリガ URL の拾い上げ ──────────────────
            if let Some(urls) = app.deep_link().get_current()? {
                for url in urls {
                    let h = app.handle().clone();
                    let u = url.to_string();
                    tauri::async_runtime::spawn(async move {
                        let _ = open_deeplink_dialog(h, &u).await;
                    });
                }
            } else {
                // deep-link 以外で起動 → ここで普通のメイン画面を開く
                tauri::WebviewWindowBuilder::new(
                    app.handle(),
                    "main",
                    tauri::WebviewUrl::App("index.html".into()),
                )
                .title("MCP Magnet")
                .build()?;
            }

            // ── 2. ランタイム中の追加リンクを監視 ───────────────
            let app_handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                for url in event.urls() {
                    let h = app_handle.clone();
                    let u = url.to_string();
                    tauri::async_runtime::spawn(async move {
                        let _ = open_deeplink_dialog(h, &u).await;
                    });
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_deeplink_dialog,
            sig_verify,
            commands::get_shell_command,
            commands::execute_shell_command,
            commands::execute_shell_command_with_channel,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
