
# Create a basic Shiny app using the custom widget
ui <- fluidPage(
  customSelectInput(
    inputId = "mySelect",
    label = "Custom Select",
    choices = c("2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"),
    selected = c("2018, 2019,"),
    multiple = TRUE
  ), 
  textOutput("selected")
)