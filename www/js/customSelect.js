
// Define the input binding for the custom select input
var customSelectInputBinding = new Shiny.InputBinding();

$.extend(customSelectInputBinding, {
  
  // Find the custom select input within the given scope
  find: function(scope) {
    return $(scope).find(".custom-select-input");
  },
  
  // Get the value of the custom select input
  getValue: function(el) {
    return $(el).find("input[type=text]").val();
  },
  
  // Set the value of the custom select input
  setValue: function(el, value) {
    var input = $(el).find("input[type=text]");
    input.val(value);
    updateSelectedText(input);
    updateSelectAllDeselectAll();
  },
  
  // Subscribe to events to detect changes and trigger callbacks
  subscribe: function(el, callback) {
    $(el).on("change.customSelectInputBinding", function(e) {
      callback();
    });
    $(el).on("click.customSelectInputBinding", function(e) {
      callback();
    });
  },
  
  // Unsubscribe from events
  unsubscribe: function(el) {
    $(el).off(".customSelectInputBinding");
  },
  
  // Receive messages from the server and update the input accordingly
  receiveMessage: function(el, data) {
    if (data.hasOwnProperty("value")) {
      this.setValue(el, data.value);
    }
    $(el).trigger("change.customSelectInputBinding");
  },
  
  // Define the rate policy for throttling input updates
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
  
  // Update the displayed text in the input based on the selected options
  function updateSelectedText(input) {
    var selected = [];
    $(input).closest(".custom-select-input").find(".dropdown-scroll-container input:checked").each(function() {
      var value = $(this).val();
      if (value) {
        selected.push(value);
      }
    });
    $(input).val(selected.length > 0 ? selected.join(", ") : "");
    $(input).trigger("change.customSelectInputBinding");
  }

  // Update the "Select All" and "Deselect All" controls based on the state of checkboxes
  function updateSelectAllDeselectAll() {
    var dropdownMenu = $(".custom-select-input .dropdown-menu");
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

  // Toggle the visibility of the dropdown menu and update related states
  function toggleDropdown() {
    var dropdownMenu = $(this).siblings(".dropdown-menu");
    $(".dropdown-menu").not(dropdownMenu).hide();
    dropdownMenu.toggle();
    updateSelectAllDeselectAll();
    
    $(this).closest(".custom-select-input").find("input[type=text]").addClass("input-focused");
    dropdownMenu.css("background-color", "white");
  }

  // Bind click events to the input and dropdown icon to toggle the dropdown
  $(".custom-select-input input[type=text]").on("click", toggleDropdown);
  $(".custom-select-input .dropdown-icon").on("click", toggleDropdown);

  // Handle the selection of items in the dropdown
  $(".custom-select-input .dropdown-item").on("click", function(e) {
    var isMultiple = $(this).closest(".custom-select-input").find("input[type=text]").attr("data-multiple") === "true";
    
    if (isMultiple) { // Multiple selection mode
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

  // Update the input and controls when checkboxes are changed
  $(".custom-select-input .dropdown-scroll-container input[type=checkbox]").on("change", function() {
    var input = $(this).closest(".custom-select-input").find("input[type=text]");
    updateSelectedText(input);
    updateSelectAllDeselectAll();
  });

  // Handle the "Select All" and "Deselect All" functionality
  $(".custom-select-input .dropdown-item.select-all").on("click", function() {
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

  // Hide dropdown when clicking outside of the custom select input
  $(document).on("click", function(e) {
    if (!$(e.target).closest(".custom-select-input").length) {
      $(".dropdown-menu").hide();
      $(".custom-select-input input[type=text]").removeClass("input-focused");
    }
  });

  // Add and remove input focus class on focus and blur events
  $(".custom-select-input input[type=text]").on("focus", function() {
    $(this).addClass("input-focused");
  });

  $(".custom-select-input input[type=text]").on("blur", function() {
    $(this).removeClass("input-focused");
  });

  // Set initial selected values on page load
  $(".custom-select-input input[type=text]").each(function() {
    var input = $(this);
    var selected = JSON.parse(input.attr("data-selected") || "[]");
    $(input).val(selected.length > 0 ? selected.join(", ") : "");
    
    if (isMultiple) { // Multiple mode
      $(input).closest(".custom-select-input").find(".dropdown-scroll-container input[type=checkbox]").each(function() {
        if (selected.includes($(this).val())) {
          $(this).prop("checked", true);
        }
      });
    }
    updateSelectAllDeselectAll();
  });
});
