module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      outputDir: "dist",
      removeElectronJunk: false,
      nodeIntegration: true,
      builderOptions: {
        productName: "Flamechat",
        mac: {
          darkModeSupport: true
        },
        dmg: {
          artifactName: "Flamechat-v${version}.${ext}",
          title: "Flamechat"
        },
        nsis: {
          artifactName: "Flamechat-v${version}.${ext}",
          deleteAppDataOnUninstall: true,
          shortcutName: "Flamechat",
          uninstallDisplayName: "Flamechat"
        }
      }
    }
  },
  devServer: {
    https: false,
    proxy: {
      "^/api": {
        target: "https://www.theparadigmdev.com",
        changeOrigin: true,
        ws: true,
        cookieDomainRewrite: {
          "*": ""
        }
      }
    }
  }
};
