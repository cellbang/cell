
export const LOGIN_PAGE_HANDLER_ADAPTER_PRIORITY = 500;
export const LOGOUT_PAGE_HANDLER_ADAPTER_PRIORITY = 500;

export const LOGIN_PAGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh-cn">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="icon" href="https://fe-static.authing.cn/dist/favicon.png" />
    <title>Authing</title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but sso doesn't work properly without JavaScript enabled.
        Please enable it to continue.</strong>
    </noscript>
    <div id="{{ guardOptions.mountId }}"></div>
    <script src="https://cdn.jsdelivr.net/npm/@authing/sso/dist/AuthingSSO.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@authing/guard/dist/Guard.umd.min.js"></script>
    <script>
      const loginByUserInfo = (userInfo) => {
          fetch('{{{ loginUrl }}}', {
              method: 'POST',
              body: JSON.stringify(userInfo),
              headers: new Headers({
                  'Content-Type': 'application/json'
              })
          }).then(res => {
              if (res.ok) {
                  location.href = "{{{ loginSuccessUrl }}}";
              }
          });
      }
      if ({{ guardOptions.isSSO }}) {
        const authing = new AuthingSSO({
            appId: "{{ guardOptions.appId }}",
            appType: "oidc",
            appDomain: "{{ guardOptions.domain }}"
        });
    
        authing.trackSession().then(function(session) {
            if(!session.session) {
                new Guard("{{ userPoolId }}", {{{ guardOptionsStr }}});
            } else {
                loginByUserInfo(session.userInfo);
            }
        });
      } else {
        const guard = new Guard("{{ userPoolId }}", {{{ guardOptionsStr }}});
        guard.on("authenticated", userInfo => {
            loginByUserInfo(userInfo);
        });
        guard.on("register", userInfo => {
        });
        guard.on("scanned-success", userInfo => {
            loginByUserInfo(userInfo);
        });
      }
    </script>
  </body>
</html>`;

export const LOGOUT_PAGE_TEMPLATE = `
<!DOCTYPE html>
<html lang="zh-cn">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <link rel="icon" href="https://fe-static.authing.cn/dist/favicon.png" />
    <title>Authing</title>
  </head>
  <body>
    <noscript>
      <strong>We're sorry but sso doesn't work properly without JavaScript enabled.
        Please enable it to continue.</strong>
    </noscript>
    <div id="{{ guardOptions.mountId }}"></div>
    <script src="https://cdn.jsdelivr.net/npm/@authing/sso/dist/AuthingSSO.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/authing-js-sdk/dist/authing-js-sdk-browser.min.js"></script>
    <script>
      const logout = () => {
        fetch("{{{ logoutUrl }}}", {
            method: "POST"
        }).then(res => {
            if ("{{ userId }}") {
                const authing = new Authing({
                    userPoolId: "{{ userPoolId }}"
                });
                    
                authing.logout("{{ userId }}");
            }
            location.href = "{{{ logoutSuccessUrl }}}";
            
        });
      }
      if ({{ isSSO }}) {
        const authing = new AuthingSSO({
            appId: "{{ sso.id }}",
            appType: "{{ sso.type }}",
            appDomain: "{{ sso.domain }}"
        });
        authing.logout().then(() => {
            logout();
        });

      } else {
        logout();
      }
    </script>
  </body>
</html>`;
