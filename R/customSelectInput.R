
#' @param inputId input ID
#' @param label the label of the widget
#' @param choices the choices to select
#' @param selected default selected options
#' @param multiple for multiple selection mode or single selection mode

vector_to_json <- function(vec) { 
  if(is.null(vec)){
    return({})
  }  
  # Check if the input is a vector
  if (!is.vector(vec)) {
    stop("Input must be a vector")
  }
  
  # Check if the vector is numeric
  if (is.numeric(vec)) {
    # Convert numeric vector to JSON array
    json_string <- paste0("[", paste(vec, collapse = ","), "]")
  }
  # Check if the vector is character
  else if (is.character(vec)) {
    # Escape double quotes in character elements
    escaped_chars <- gsub('"', '\\"', vec)
    # Convert character vector to JSON array
    json_string <- paste0("[\"", paste(escaped_chars, collapse = "\",\""), "\"]")
  }
  # Check if the vector is logical
  else if (is.logical(vec)) {
    # Convert logical vector to JSON array
    json_string <- paste0("[", paste(tolower(as.character(vec)), collapse = ","), "]")
  }
  # Handle other types
  else {
    stop("Vector type not supported")
  }
  
  return(json_string)
}

customSelectInput <- function(inputId, label = NULL, choices = NULL, selected = NULL, multiple = FALSE) {
  
  # define the input element
  input_element <- tags$input(
    id = paste0(inputId, "-input"), # Add inputId here
    type = "text", readonly = "readonly", class = "form-control",
    placeholder = ifelse(multiple, "Select options", "Select an option"), 
    `data-selected` = vector_to_json(selected),
    `data-options` = choices,
    `data-multiple` = ifelse(multiple, "true", "false"),
  )

  # define the dropdown content
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
  
  # return the custom select input
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
          id = paste0(inputId, "-dropdown-menu"),
          class = "dropdown-menu",
          dropdown_content
        ),
        tags$span("⌵", class = "dropdown-icon", id = paste0(inputId, "-icon"))
      )
    ),
    # Link to external JavaScript file
    includeScript("www/js/customSelect.js")
  )
}
