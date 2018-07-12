from wtforms import Form, BooleanField, StringField, PasswordField, validators, TextAreaField, SubmitField, FileField


class Login(Form):
    login_user = StringField('Username', [validators.data_required()])
    login_pass = PasswordField('Password', [validators.data_required()])


class Register(Form):
    username = StringField('Username', [validators.Length(min=2, max=12)])
    password = PasswordField('Password', [
        validators.data_required(),
        validators.EqualTo('confirm_password', message='Passwords do not match')
    ])
    confirm_password = PasswordField('Confirm Password')
    email = StringField('Email', [validators.Length(min=6, max=35)])


class UploadForm(Form):
    annotation = TextAreaField(u'Annotation', [validators.optional(), validators.length(max=500)])
    upload_b = SubmitField('Upload')
    browse_b = SubmitField('Browse')


class BrowseForm(Form):
    annotation = TextAreaField(u'Annotation', [validators.optional(), validators.length(max=500)])
    # browse = SubmitField('Browse')
    next = SubmitField('Next')
    previous = SubmitField('Previous')
    first = SubmitField('Frist')
    last = SubmitField('Last')
    update = SubmitField('Update Annotation')
    # image = FileField(u'Image File')
