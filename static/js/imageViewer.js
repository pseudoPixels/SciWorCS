// JavaScript Document
viewer.toolbarImages="static/img/toolbar"
			viewer.onload =  viewer.toolbar;

			var viewerObject = new viewer({
				parent: document.getElementById('imageViewer'),
				imageSource: {{src}},
				frame: ['600px','350px']
			});

