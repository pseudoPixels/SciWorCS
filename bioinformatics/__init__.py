from flask import Blueprint

bioinformatics = Blueprint(
'bioinformatics',
__name__,
template_folder='templates',
static_folder='static',
static_url_path='/bioinformatics/static'
)

from bioinformatics import views