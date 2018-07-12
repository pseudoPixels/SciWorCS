from flaskext.couchdb import Document, TextField, FloatField, DictField, Mapping


# class PlantPhenotype(Document):
#     source = TextField()
#     imglink = TextField()
#     annotation = TextField()
class PlantPhenotype(Document):
    source = TextField()
    imglink = TextField()
    annotation = TextField()
    height = TextField()
    width = TextField()
    area = TextField()
    size = TextField()
    soilCondition = TextField()
    localSat = TextField()
    location = TextField()
    weather = TextField()


class Users(Document):
    username = TextField()
    password = TextField()
    email = TextField()


class LSystemModel(Document):
    imgobj = None
    user = TextField()
    scale = FloatField()
    velocity = FloatField()
    depth = FloatField()
    maxAngle = FloatField()
    minAngle = FloatField()
    speed = FloatField()
    segments = FloatField()
    rotation = FloatField()
    src = TextField()
    rules = DictField(Mapping.build(
        ruleA=TextField(),
        ruleB=TextField(),
        ruleC=TextField(),
        ruleD=TextField(),
        ruleE=TextField(),
    ))
