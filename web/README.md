> Web files for creating affiliate web instance. Save files in public_html folder in web server or host server.

## Affiliate Programme

The affiliate programme enables individuals or organisations to create their own instance of TronPredict using the TronPredict codebase. No developer skills required.

## Affiliate Web Files

### Main Files 
> These files link users to TronPredict's distributed app and smart contract. Users will access via 'https://your.domain.com' to access the index.html file.
- web.js
- index.html
> Update web.js file as follows. *Affiliate's Tron account public address ensures allocation of rewards to the affiliate.* **[Important]**
```javascript
/* 
    Affiliate's Tron account public address
    Replace Own Tron account public address
    e.g. var affiliate = 'TLNUN136hHaJkqNdKVfeTz3R8Tvt3iKfbM';
*/
var affiliate = '';
```

### Affiliate Admin Files
> These files gives affiliate access to dashboard. Affiliates will access 'https://your.domain.com/admin.html' to access the dashboard.
- admin.js
- admin.css
- admin.html

## Docs

Affiliate programme documentation at https://docs.tronpredict.com/v3.0/
