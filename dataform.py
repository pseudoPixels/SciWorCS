from flask_wtf import Form
from wtforms import StringField, TextAreaField, SelectField, validators, SubmitField, ValidationError, Label


def datadefine():
    data = {'none', 'one'}
    return data


class Dataform(Form):
    Annotation = TextAreaField("annotation", [validators.required("Need to enter annotation of this picture")])
    data = datadefine()
    Sel_Dir = SelectField('Sel_Dir', choices={(x, x) for x in data})
    dir_name = StringField("New Directory")
    submit = SubmitField('UpLoad')


class LSystemform(Form):
    ruleA = StringField()
    ruleB = StringField()
    ruleC = StringField()
    ruleD = StringField()
    ruleE = StringField()
    scale = StringField()
    depth = StringField()
    segment = StringField()
    minAngle = StringField()
    maxAngle = StringField()
    velocity = StringField()
    rotation = StringField()
    speed = StringField()

