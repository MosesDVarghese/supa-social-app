To keep the changes made in node_modules, install patch-package:

`npm i patch-package`

add it to scripts:

```javascript
"scripts": {
    ...
    "postinstall": "patch-package"
  },
```

Then add the packages that need to remain the same:

`npx patch-package react-native-webview`

`npx patch-package react-native-pell-rich-editor`
