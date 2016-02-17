/*!
 * Froala Embedly Cards Plugin
 * Written by Aamir Adnan (aamir.adnan.rind@gmail.com)
 * Tested with Froala v2.0.5 (https://www.froala.com/wysiwyg-editor)
 */

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = function( root, jQuery ) {
            if ( jQuery === undefined ) {
                // require('jQuery') returns a factory that requires window to
                // build a jQuery instance, we normalize how we use modules
                // that require this pattern but the window provided is a noop
                // if it's defined (how jquery works)
                if ( typeof window !== 'undefined' ) {
                    jQuery = require('jquery');
                }
                else {
                    jQuery = require('jquery')(root);
                }
            }
            factory(jQuery);
            return jQuery;
        };
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

  'use strict';

  var urlRe = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?(\#([a-zA-Z0-9$\-_.+!*'(),;:@&=\/?]|%[0-9a-fA-F]{2})*)?)?$/;

  // Define popup template.
  $.extend($.FroalaEditor.POPUP_TEMPLATES, {
    "embedly.insert": '[_BUTTONS_][_INPUT_LAYER_]'
  });

  $.extend($.FroalaEditor.DEFAULTS, {
    embedlyOptions: {},
    embedlyHelpText: 'Paste a URL to generate code'
  });

  // The custom popup is defined inside a plugin (new or existing).
  $.FroalaEditor.PLUGINS.embedly = function (editor) {
    // Create custom popup.
    function initPopup () {
      // Popup buttons.
      var popup_buttons = '';

      // Create the list of buttons.
      if (editor.opts.popupButtons && editor.opts.popupButtons.length > 0) {
        popup_buttons += '<div class="fr-buttons">';
        popup_buttons += editor.button.buildList(editor.opts.popupButtons);
        popup_buttons += '</div>';
      }

      var tab_idx = 0;
      var input_layer = '<div class="fr-link-insert-layer fr-layer fr-active" id="fr-link-insert-layer-' + editor.id + '">';
      input_layer += '<ul class="errorlist" style="display:none;"></ul>';
      if (editor.opts.embedlyHelpText){
        input_layer += '<span class="fr-small-text">'+editor.language.translate(editor.opts.embedlyHelpText)+'</span>';
      }
      input_layer += '<div class="fr-input-line"><input name="href" type="text" class="fr-link-attr" placeholder="URL" tabIndex="' + (++tab_idx) + '"></div>';
      input_layer += '<div class="fr-action-buttons"><button class="fr-command fr-submit" data-cmd="linkEmbedlyInsert" href="#" tabIndex="' + (++tab_idx) + '" type="button">' + editor.language.translate('Insert') + '</button></div></div>';

      // Load popup template.
      var template = {
        buttons: popup_buttons,
        input_layer: input_layer
      };

      // Create popup.
      var $popup = editor.popups.create('embedly.insert', template);

      return $popup;
    }

    // Show the popup
    function showPopup () {
      // Get the popup object defined above.
      var $popup = editor.popups.get('embedly.insert');

      // If popup doesn't exist then create it.
      // To improve performance it is best to create the popup when it is first needed
      // and not when the editor is initialized.
      if (!$popup) $popup = initPopup();

      //reset popup
      resetPopup();

      // Set the editor toolbar as the popup's container.
      editor.popups.setContainer('embedly.insert', editor.$tb);

      // This will trigger the refresh event assigned to the popup.
      // editor.popups.refresh('embedly.insert');

      // This custom popup is opened by pressing a button from the editor's toolbar.
      // Get the button's object in order to place the popup relative to it.
      var $btn = editor.$tb.find('.fr-command[data-cmd="embedlyBtn"]');

      // Set the popup's position.
      var left = $btn.offset().left + $btn.outerWidth() / 2;
      var top = $btn.offset().top + (editor.opts.toolbarBottom ? 10 : $btn.outerHeight() - 10);

      // Show the custom popup.
      // The button's outerHeight is required in case the popup needs to be displayed above it.
      editor.popups.show('embedly.insert', left, top, $btn.outerHeight());
    }

    function resetPopup(){
      var $popup = editor.popups.get('embedly.insert');
      var $errors = $popup.find('ul.errorlist');
      var $input = $popup.find('input.fr-link-attr[type="text"][name="href"]');
      $errors.hide();
      $errors.html('');
      $input.val('').trigger('change');
    }

    // Hide the custom popup.
    function hidePopup () {
      editor.popups.hide('embedly.insert');
    }

    function showError(error){
      var $popup = editor.popups.get('embedly.insert');
      var $errors = $popup.find('ul.errorlist');
      var $input = $popup.find('input.fr-link-attr[type="text"][name="href"]');
      $errors.html('<li>'+error+'</li>').fadeIn();
      $input.one('keyup', function(){
        $errors.fadeOut();
      });
    }

    function insert(url){
      // Make sure we have focus.
      editor.events.focus(true);
      editor.selection.restore();

      //Trim off the whitespace.
      var clean = $.trim(url);

      if (clean === ''){
        showError('The URL is invalid. Please enter a valid URL.');
        return false;
      }

      //Escape whitespace
      clean = clean.replace(/ /g, '%20');

      // Make sure we have a protocol.
      if (!(/^https?:\/\//i).test(clean)){
        clean = 'http://' + clean;
      }

      if (!urlRe.test(clean)){
        showError('The URL is invalid. Please enter a valid URL.');
        return false;
      }

      var a = document.createElement('a');
      a.href = clean;

      var $card = $('#embedly-card-area');
      if ($card.length === 0){
        $card = $('<div />').appendTo('body');
        $card.attr('id', 'embedly-card-area');
        $card.css('display', 'none');
      }else {
        // If there was anything else, kill it.
        $card.empty();
      }

      $card.append(a);

      // this lets us do the setting of things.
      var frame = embedly.card(a);

      if (frame){
        //Create the embed code when the snippet changes.
        frame.on('card.snippet', function(data){
          var $snippet = $(data.snippet);
          for (var key in editor.opts.embedlyOptions) {
            if (editor.opts.embedlyOptions.hasOwnProperty(key)) {
              $snippet.attr('data-card-'+key, editor.opts.embedlyOptions[key]);
            }
          }
          editor.html.insert('<p><span contenteditable="false" class="embedly-card-area" data-url="' + clean + '" data-title="' + $snippet.text() + '">' + $snippet[0].outerHTML + '</span></p><p><br></p>');
          var $card_embed = editor.$el.find('.embedly-card-area');
          editor.selection.setAfter($card_embed.parent().next().get(0));
          editor.popups.hide('embedly.insert');
          editor.events.trigger('embedly.inserted', [$card_embed, clean, $snippet[0].outerHTML]);
          return true;
        });

        //Create the embed code when the snippet changes.
        frame.on('card.rendered', function(data){
          if (data.name === "error"){
            showError('Cannot create a card for the url. Please check the URL you entered is correct.');
            return true;
          }
          frame.send('card.snippet');
        });
      }else{
        showError('Cannot create a card for the url. Please check the URL you entered is correct.');
      }

      return false;
    }

    function insertCallback () {
      var $popup = editor.popups.get('embedly.insert');
      var url = $popup.find('input.fr-link-attr[type="text"][name="href"]').val();

      var t = $(editor.original_window).scrollTop();
      insert(url);
      $(editor.original_window).scrollTop(t);
    }

    // Methods visible outside the plugin.
    return {
      showPopup: showPopup,
      hidePopup: hidePopup,
      insertCallback: insertCallback,
      resetPopup: resetPopup
    }
  };

  // Define an icon and command for the button that opens the custom popup.
  $.FroalaEditor.DefineIcon('embedlyBtnIcon', {NAME: 'code'});
  $.FroalaEditor.RegisterCommand('embedlyBtn', {
    title: 'Embed',
    icon: 'embedlyBtnIcon',
    undo: false,
    focus: true,
    popup: true,
    refreshOnCallback: false,
    callback: function () {
      if (!this.popups.isVisible('embedly.insert')) {
        this.embedly.showPopup();
      }
      else {
        if (this.$el.find('.fr-marker')) {
          this.events.disableBlur();
          this.selection.restore();
        }
        this.popups.hide('embedly.insert');
      }
    }
  });

  // Define custom popup insert button command.
  $.FroalaEditor.RegisterCommand('linkEmbedlyInsert', {
    focus: false,
    refreshAfterCallback: false,
    callback: function () {
      this.embedly.insertCallback();
    }
  })

}));
