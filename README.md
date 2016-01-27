# Froala Embedly Plugin

This plugin allows you to easily add [embedly cards](http://embed.ly/cards) in the Froala WYSIWYG editor. To get started:

```
<!-- Register Froala and FontAwesome CSS here -->
<!-- Register jQuery and Froala editor JavaScript here -->

<!-- include embedly plugin -->
<script src="js/plugins/embedly.js"></script>

<!-- Include official embedly libraries -->
<script async src="https://cdn.embedly.com/widgets/platform.js" charset="UTF-8"></script>
<script src="https://cdn.embed.ly/jquery.embedly-3.1.1.min.js" charset="UTF-8"></script>

<!-- Sets up the default key for the embedly jQuery Plugin. -->
<script type="text/javascript">
  $.embedly.defaults.key = '{Your_Embedly_Account_Key}';
</script>

<!-- Initialize the editor and add "embedlyBtn" in toolbar -->
<script type="text/javascript">
  $(document).ready(function() {
    $('#editor').froalaEditor({
      inlineMode: false,
      toolbarButtons: ['bold', 'italic', 'embedlyBtn']
    });
  });
</script>
```

Add following CSS code for some styling:

```
<style>
  .fr-popup ul.errorlist { display: block; padding: 0; margin: 0 0 5px 0; }
  .fr-popup ul.errorlist li{
    font-size: 12px;
    line-height: 16px;
    color: #b73018;
    list-style-type:none;
  }
  .fr-small-text { font-size: 16px; }
</style>
```

For an example, open `example.html` in your browser.

Configuration:
- `embedlyOptions` (default: {})
  - Allows you to override options for how the cards are rendered. For all options check the [cards documentation](http://docs.embed.ly/docs/cards#customize)

    ```
      $('#editor').froalaEditor({
        --
        embedlyOptions: {
          controls: 0, // Disable Share Icons
          recommend: 0 // Disable Embedly Recommendations on video and rich cards.
        }
      });
    ```
- `embedlyHelpText` (default: 'Paste a URL to generate code')
  - A help text which appears in a popup above the URL input field. Set it to `null` or `''` to not display any help text.

    ```
      $('#editor').froalaEditor({
        --
        embedlyHelpText: 'Add URL below'
      });
    ```