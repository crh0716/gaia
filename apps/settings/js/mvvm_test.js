'use strict';

navigator.mozL10n.ready(function() {
  var thing1 = Observable({name: 'thing1', checked: true});
  var thing2 = Observable({name: 'thing2', checked: false});
  var array = ObservableArray([thing1]);
  var counter = 0;

  ListView(document.querySelector('#mvvmtest .listView'), array,
    function(item) {
      var content;
      var element, checkbox;

      function refreshCheck() {
        checkbox.checked = content.checked;
        console.log('set element', checkbox.dataset.count, content.name,
                    content.checked);
      }

      var refresh = function(newContent) {
        if (!element) {
          element = document.createElement('li');
          checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.dataset.count = ++counter;
          element.appendChild(checkbox);
        }

        if (content != newContent) {
          // unobserve all properties
          if (content) {
            content.unobserve('checked', refreshCheck);
          }
          content = newContent;
          if (content) {
            content.observe('checked', refreshCheck);
          }
        }

        refreshCheck();
      };

      refresh(item);

      return {
        get element() {
          return element;
        },
        refresh: function(value) {
          refresh(value);
        }
      };
  });


  thing1.checked = false; // sets! yay!
  array.set(0, thing2); // sets again - yay! we reused it!
  thing2.checked = true; // sets! yay!

  thing1.checked = false; // sets! :(
});
