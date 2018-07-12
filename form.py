from flask_wtf import Form
from wtforms import StringField, TextAreaField, SelectField, SubmitField, validators, ValidationError

data = {'Rainy', "Sunny", "Windy"}


class ContactForm(Form):
    source = SelectField('source')
    send = SubmitField('select source')
    metaData = StringField("metaData")
    height = StringField("Height")
    width = StringField("Width")
    area = StringField("Area")
    size = StringField("Size")
    soilCondition = StringField("Soil Condition")
    localSaturation = StringField("Local Saturation")
    location = StringField("Location")
    weatherCondition = SelectField("Weather Condition", choices={(x, x) for x in data})
    textArea = TextAreaField("Other")

# , [validators.required("Dont Enter Anything")]


