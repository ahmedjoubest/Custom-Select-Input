function CustomSelectInputJS(inputId) {
  // Define the input binding for the custom select input
  var customSelectInputBinding = new Shiny.InputBinding();

  $.extend(customSelectInputBinding, {
    find: function(scope) {
      return $(scope).find(".custom-select-input");
    },
    getValue: function(el) {
      return $(el).find("input[type=text]").val();
    },
    setValue: function(el, value) {
      var input = $(el).find("input[type=text]");
      input.val(value);
      updateSelectedText(input);
      updateSelectAllDeselectAll();
    },
    subscribe: function(el, callback) {
      $(el).on("change.customSelectInputBinding", function(e) {
        callback();
      });
      $(el).on("click.customSelectInputBinding", function(e) {
        callback();
      });
    },
    unsubscribe: function(el) {
      $(el).off(".customSelectInputBinding");
    },
    receiveMessage: function(el, data) {
      if (data.hasOwnProperty("value")) {
        this.setValue(el, data.value);
      }
      $(el).trigger("change.customSelectInputBinding");
    },
    getRatePolicy: function() {
      return {
        policy: "throttle",
        delay: 250
      };
    }
  });

  // Register the input binding with Shiny
  Shiny.inputBindings.register(customSelectInputBinding);

  $(document).ready(function() {
    function updateSelectedText(input) {
      var selected = [];
      $(input).closest("#" + inputId).find(".dropdown-scroll-container input:checked").each(function() {
        var value = $(this).val();
        if (value) {
          selected.push(value);
        }
      });
      $(input).val(selected.length > 0 ? selected.join(", ") : "");
      $(input).trigger("change.customSelectInputBinding");
    }

    function updateSelectAllDeselectAll() {
      var dropdownMenu = $("#" + inputId + "-dropdown-menu");
      var checkboxes = dropdownMenu.find(".dropdown-scroll-container input[type=checkbox]:not(.select-all-checkbox)");
      var allChecked = checkboxes.length === checkboxes.filter(":checked").length;
      if (allChecked) {
        dropdownMenu.find(".select-all-checkbox").prop("checked", true);
        dropdownMenu.find(".select-all span").text("Deselect All");
      } else {
        dropdownMenu.find(".select-all-checkbox").prop("checked", false);
        dropdownMenu.find(".select-all span").text("Select All");
      }
    }

    function toggleDropdown() {
      var dropdownMenu = $(this).siblings("#" + inputId + "-dropdown-menu");
      $(".dropdown-menu").not(dropdownMenu).hide();
      dropdownMenu.toggle();
      updateSelectAllDeselectAll();
      
      $(this).closest(".custom-select-input").find("input[type=text]").addClass("input-focused");
      dropdownMenu.css("background-color", "white");
    }

    $("#" + inputId + "-input").on("click", toggleDropdown);
    $("#" + inputId + "-icon").on("click", toggleDropdown);

    $("#" + inputId + " .dropdown-item").on("click", function(e) {
      var isMultiple = $(this).closest(".custom-select-input").find("input[type=text]").attr("data-multiple") === "true";
      if (isMultiple) { // Multiple mode
        if (e.target.tagName === "INPUT") {
          return;
        }
        var checkbox = $(this).find("input[type=checkbox]");
        checkbox.prop("checked", !checkbox.prop("checked"));
        var input = $(this).closest(".custom-select-input").find("input[type=text]");
        updateSelectedText(input);
        updateSelectAllDeselectAll();
        e.stopPropagation();
      } else { // Single selection mode
        var selectedOption = $(this).find(".option-text").attr("data-value");
        var input = $(this).closest(".custom-select-input").find("input[type=text]");
        var singleCheckbox = $(this).find(".single-checkbox");
        
        if ($(input).val() === selectedOption) {
          $(input).val("");
          singleCheckbox.removeClass("checked"); // Uncheck the circle
        } else {
          $(input).val(selectedOption);
          $(this).closest(".dropdown-scroll-container").find(".single-checkbox").removeClass("checked"); // Uncheck all circles
          singleCheckbox.addClass("checked"); // Check the selected circle
        }

        $(input).trigger("change.customSelectInputBinding");
        e.stopPropagation();
      }
    });

    $("#" + inputId + " .dropdown-scroll-container input[type=checkbox]").on("change", function() {
      var input = $(this).closest(".custom-select-input").find("input[type=text]");
      updateSelectedText(input);
      updateSelectAllDeselectAll();
    });

    $("#" + inputId + " .dropdown-item.select-all").on("click", function() {
      var dropdownMenu = $(this).closest(".dropdown-menu");
      var checkboxes = dropdownMenu.find(".dropdown-scroll-container input[type=checkbox]:not(.select-all-checkbox)");
      var allChecked = checkboxes.length === checkboxes.filter(":checked").length;
      checkboxes.prop("checked", allChecked ? false : true);
      var input = $(this).closest(".custom-select-input").find("input[type=text]");
      if (allChecked) {
        $(input).val("");
      } else {
        updateSelectedText(input);
      }
      updateSelectAllDeselectAll();
      $(input).trigger("change.customSelectInputBinding");
    });

    $(document).on("click", function(e) {
      if (!$(e.target).closest(".custom-select-input").length) {
        $(".dropdown-menu").hide();
        $(".custom-select-input input[type=text]").removeClass("input-focused");
      }
    });

    $("#" + inputId + "-input").on("focus", function() {
      $(this).addClass("input-focused");
    });

    $("#" + inputId + "-input").on("blur", function() {
      $(this).removeClass("input-focused");
    });

    // Set initial selected values on page load
    $("#" + inputId + "-input").each(function() {
      var input = $(this);
      var selected = JSON.parse(input.attr("data-selected") || "[]");
      $(input).val(selected.length > 0 ? selected.join(", ") : "");
      var isMultiple = $(this).closest(".custom-select-input").find("input[type=text]").attr("data-multiple") === "true";
      if (isMultiple) { // Multiple mode
        $(input).closest(".custom-select-input").find(".dropdown-scroll-container input[type=checkbox]").each(function() {
          if (selected.includes($(this).val())) {
            $(this).prop("checked", true);
          }
        });
      } else {
      // Handle single selection mode
      $(input).closest(".custom-select-input").find(".dropdown-scroll-container .dropdown-item.single-select-item").each(function() {
          var optionValue = $(this).find(".option-text").attr("data-value");
          if (selected.includes(optionValue)) {
              $(this).find(".single-checkbox").addClass("checked"); // Mark the option as checked
              $(input).val(optionValue); // Set the input value
          }
      });
      }
      updateSelectAllDeselectAll();
    });
  });
}