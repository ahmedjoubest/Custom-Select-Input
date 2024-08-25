
#' @param inputId input ID
#' @param label the label of the widget
#' @param choices the choices to select
#' @param selected default selected options
#' @param multiple for multiple selection mode or single selection mode

library(jsonlite)

customSelectInput <- function(inputId, label = NULL, choices = NULL, selected = NULL, multiple = FALSE) {
  
  # Convert selected options to a JSON string
  selected_json <- toJSON(selected)
  
  input_element <- tags$input(
    id = paste0(inputId, "-input"), # Add inputId here
    type = "text", readonly = "readonly", class = "form-control",
    placeholder = ifelse(multiple, "Select options", "Select an option"), 
    `data-selected` = selected_json,
    `data-options` = toJSON(choices),
    `data-multiple` = ifelse(multiple, "true", "false"),
  )

  dropdown_content <- if (multiple) {
    tags$div(
      id = paste0(inputId, "-dropdown-content"), # Add inputId here
      class = "dropdown-content",
      tags$div(
        class = "dropdown-item select-all", 
        tags$input(type = "checkbox", class = "custom-checkbox select-all-checkbox", value = ""),
        tags$span("Select All")
      ),
      tags$div(class = "dropdown-divider"),
      tags$div(
        class = "dropdown-scroll-container",
        lapply(choices, function(option) {
          tags$div(
            class = "dropdown-item",
            tags$input(
              type = "checkbox", value = option, class = "custom-checkbox"
            ),
            tags$span(option, class = "option-text")
          )
        })
      )
    )
  } else {
    tags$div(
      id = paste0(inputId, "-dropdown-content"), # Add inputId here
      class = "dropdown-content",
      tags$div(
        class = "dropdown-scroll-container",
        lapply(choices, function(option) {
          tags$div(
            class = "dropdown-item single-select-item",
            tags$span(class = "single-checkbox"), # Empty circle for single mode
            tags$span(option, class = "option-text", `data-value` = option)
          )
        })
      )
    )
  }
  
  tagList(
    includeCSS("www/css/customSelect.css"),
    div(
      class = "form-group shiny-input-container",
      if (!is.null(label)) {
        tags$label(`for` = inputId, label)
      },
      div(
        id = inputId, class = "custom-select-input",
        input_element,
        tags$div(
          id = paste0(inputId, "-dropdown-menu"), # Add inputId here
          class = "dropdown-menu",
          dropdown_content
        ),
        tags$span("⌵", class = "dropdown-icon", id = paste0(inputId, "-icon")) # Add inputId here
      )
    ),
    # Link to external JavaScript file
    includeScript("www/js/customSelect.js"),
    tags$script(HTML(sprintf("
                  CustomSelectInputJS('%s');
                              ", inputId)))
  
  )
}
