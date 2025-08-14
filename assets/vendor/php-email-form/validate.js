/**
* PHP Email Form Validation - v3.9
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    // Envie como FormData e apenas peça JSON na resposta.
    // NÃO defina 'Content-Type' manualmente para evitar preflight/CORS.
    fetch(action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData
    })
    .then(res => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (res.ok) {
        // Sucesso: mostra mensagem e reseta form
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
        return;
      }
      // Tenta extrair erro amigável do FormSubmit
      return res.json()
        .then(data => { throw new Error(data.error || `Failed: ${res.status} ${res.statusText}`); })
        .catch(() => { throw new Error(`Failed: ${res.status} ${res.statusText}`); });
    })
    .catch(error => {
      displayError(thisForm, error.message || error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
