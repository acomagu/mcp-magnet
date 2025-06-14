import { type Platform } from '../platform';
import { type Runtime } from '../runtime/runtime';
import { type ShellExecutorService } from '../shellExecutor';
import { DenoRuntime } from './DenoRuntime';
import { NodeRuntime } from './NodeRuntime';
import { PythonRuntime } from './PythonRuntime';

// 多分こんなことせずにRuntimesをContextで渡しちゃうほうがいい気がする
const cache = new Map<Platform, Map<ShellExecutorService, Runtime[]>>();

export function createKnownRuntimes(platform: Platform, shellExecutor: ShellExecutorService): Runtime[] {
  if (cache.has(platform) && cache.get(platform)?.has(shellExecutor)) {
    return cache.get(platform)!.get(shellExecutor)!;
  }
  const runtimes = [
    new DenoRuntime(platform, shellExecutor),
    new NodeRuntime(platform, shellExecutor),
    new PythonRuntime(platform, shellExecutor),
  ];
  if (!cache.has(platform)) {
    cache.set(platform, new Map());
  }
  cache.get(platform)!.set(shellExecutor, runtimes);
  return runtimes;
}
