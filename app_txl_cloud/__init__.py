from flask import Blueprint

app_txl_cloud = Blueprint(
'app_txl_cloud',
__name__,
template_folder='templates',
static_folder='static',
static_url_path='/app_txl_cloud/static'
)

from app_txl_cloud import views