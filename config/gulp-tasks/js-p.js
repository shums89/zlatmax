export const jsp = () => {
	return app.gulp.src(app.path.buildFolder + '/js/app.min.js')
		.pipe(app.plugins.plumber(
			app.plugins.notify.onError({
				title: "JSP",
				message: "Error: <%= error.message %>"
			}))
		)
		.pipe(app.plugins.prettier({}))
		.pipe(app.plugins.rename("app.js"))
		.pipe(app.gulp.dest(app.path.build.js));
}