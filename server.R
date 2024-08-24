
server <- function(input, output, session) {
  output$selected <- renderText({
    paste("Selected:", paste(input$mySelect, collapse = ", "))
  })
}