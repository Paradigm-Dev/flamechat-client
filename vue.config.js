module.exports = {
  transpileDependencies: ["vuetify"],
  pluginOptions: {
    electronBuilder: {
      outputDir: "dist",
      removeElectronJunk: true,
      nodeIntegration: true,
      builderOptions: {
        productName: "Wire",
        mac: {
          darkModeSupport: true
        },
        dmg: {
          artifactName: "Wire-v${version}.${ext}",
          title: "Wire"
        },
        nsis: {
          artifactName: "Wire-v${version}.${ext}",
          deleteAppDataOnUninstall: true,
          shortcutName: "Wire",
          uninstallDisplayName: "Wire"
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
