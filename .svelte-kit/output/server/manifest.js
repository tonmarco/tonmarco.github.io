export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([".DS_Store","files/DavisCenterFloorplans.pdf","files/ic2s2_2026_schedule.csv","files/ic2s2_2026_word_template_tutorials.docx","files/platapus.png","files/program-overview.pdf","files/qr_code_ic2s2_poster_poll_day_1.png","files/qr_code_ic2s2_poster_poll_day_2.png","files/qr_code_ic2s2_poster_poll_day_3.png","files/zinnes_map.webp","images/.DS_Store","images/ic2s2_2026_backdrop.mp4","images/ic2s2_2026_backdrop.png","images/ic2s2_2026_backdrop.webm","images/ic2s2_logo_black.png","images/ic2s2_logo_black.svg","images/ic2s2_logo_full.png","images/ic2s2_logo_full_square.png","images/ic2s2_logo_white.png","images/keynotes/abby_andre.jpg","images/keynotes/brooke-welles.jpg","images/keynotes/brooke.jpg","images/keynotes/derek_curry.png","images/keynotes/gasper_begus.png","images/keynotes/image1.png","images/keynotes/image18.png","images/keynotes/image19.png","images/keynotes/image2.png","images/keynotes/image20.png","images/keynotes/image7.png","images/keynotes/image8.png","images/keynotes/jan_eisfeldt.jpeg","images/keynotes/jennifer_gradecki.png","images/keynotes/jonathan_gilmour.jpg","images/keynotes/kate_starbird.png","images/keynotes/katy_milkman.jpeg","images/keynotes/km2.jpg","images/keynotes/mirta.jpg","images/keynotes/peter.jpg","images/keynotes/rafael_prieto.jpg","images/keynotes/timothy.png","images/og-image.png","images/people/Lorenzo_Lucchini_square2.png","images/people/alessia_melegaro_1.jpeg","images/people/alexa.jpg","images/people/andi-elledge.jpg","images/people/ashley-fehr.jpg","images/people/brooke-welles.jpg","images/people/bruno_lepri_1.jpg","images/people/calla-beauregard.jpg","images/people/chris.jpg","images/people/debora_nozza_2.jpg","images/people/duilio_balsamo_1.jpg","images/people/ivana_crescenzi.jpg","images/people/jaramillo.jpg","images/people/jso.jpg","images/people/juni.jpg","images/people/kathryn-stanton.jpg","images/people/km2.jpg","images/people/marco-tonin.png","images/people/maria.png","images/people/milo-trujillo.jpg","images/people/mirta-galesic.jpg","images/people/peter.jpg","images/people/profile_MicheleTizzoni.png","images/people/raya_muttarak_1_v2.jpg","images/people/tim_tangherlini.jpg","images/people/timothy-tangherlini.jpg","images/people/timothy-tangherlini.png","images/person.svg","images/sponsors/Bocconi_University_Logo.webp","images/sponsors/UVM_Logo_Primary_Horiz_G.svg","images/sponsors/vt_epscor.png","images/tutorials/XuechunziBai.jpeg","images/tutorials/ben.jpg","images/tutorials/bufan.png","images/tutorials/cameron_moy.avif","images/tutorials/chris.jpg","images/tutorials/dallas_card.jpg","images/tutorials/david.jpeg","images/tutorials/david_jurgens.jpeg","images/tutorials/deen_freelon.avif","images/tutorials/gayoung_jeon.avif","images/tutorials/gayoung_jeon.jpg","images/tutorials/georg.jpeg","images/tutorials/gianluca.jpg","images/tutorials/headshot-piccardi.jpg","images/tutorials/headshot-saveski.jpg","images/tutorials/indira.png","images/tutorials/jason_radford.png","images/tutorials/jblackbu.jpg","images/tutorials/jens.png","images/tutorials/jso.jpg","images/tutorials/kristina.jpeg","images/tutorials/markus.jpeg","images/tutorials/maximilian.png","images/tutorials/michael-arnold.jpg","images/tutorials/nicholas_weber.jpg","images/tutorials/pranav.jpeg","images/tutorials/sabina_tomkins.jpg","images/tutorials/scott.png","images/ui/overlay.png","images/ui/shadow.png","images/venue/Piazza del Duomo.jpg","images/venue/background_v3.mp4","images/venue/bocconi.jpg","images/venue/burlington.jpg","images/venue/burlington_bike_path.jpg","images/venue/burlington_waterfront.png","images/venue/campus_2.jpg","images/venue/citta.jpg","images/venue/dudley_center.jpg","images/venue/knowledge.jpg","images/venue/uvm_campus.webp","images/venue/uvm_waterman.png","robots.txt"]),
	mimeTypes: {".pdf":"application/pdf",".csv":"text/csv",".png":"image/png",".webp":"image/webp",".mp4":"video/mp4",".webm":"video/webm",".svg":"image/svg+xml",".jpg":"image/jpeg",".jpeg":"image/jpeg",".avif":"image/avif",".txt":"text/plain"},
	_: {
		client: {start:"_app/immutable/entry/start.CofSq08Q.js",app:"_app/immutable/entry/app.DWA2RNV5.js",imports:["_app/immutable/entry/start.CofSq08Q.js","_app/immutable/chunks/CBpS4qen.js","_app/immutable/chunks/BbpNz1p5.js","_app/immutable/entry/app.DWA2RNV5.js","_app/immutable/chunks/BbpNz1p5.js","_app/immutable/chunks/CyoWzouY.js","_app/immutable/chunks/2TU3FloQ.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js'))
		],
		remotes: {
			
		},
		routes: [
			
		],
		prerendered_routes: new Set(["/","/sitemap.xml","/topics/","/venue/","/conduct/","/program/","/organization/","/about/","/accommodation/","/getting-there/","/keynotes/","/posters/","/program/print/","/register/","/scavenger-hunt/","/sponsor-us/","/sponsors/","/submit-abstract/","/submit-tutorial/","/travel-grants/","/tutorials/"]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
