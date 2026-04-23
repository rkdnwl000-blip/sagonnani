const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 모노레포 워크스페이스 패키지 인식
config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// TypeScript 소스 파일 직접 해석
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'ts',
  'tsx',
];

module.exports = config;
