
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/about" | "/accommodation" | "/conduct" | "/getting-there" | "/keynotes" | "/organization" | "/posters" | "/program" | "/program/print" | "/register" | "/scavenger-hunt" | "/sitemap.xml" | "/sponsor-us" | "/sponsors" | "/submit-abstract" | "/submit-tutorial" | "/topics" | "/travel-grants" | "/tutorials" | "/venue";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/about": Record<string, never>;
			"/accommodation": Record<string, never>;
			"/conduct": Record<string, never>;
			"/getting-there": Record<string, never>;
			"/keynotes": Record<string, never>;
			"/organization": Record<string, never>;
			"/posters": Record<string, never>;
			"/program": Record<string, never>;
			"/program/print": Record<string, never>;
			"/register": Record<string, never>;
			"/scavenger-hunt": Record<string, never>;
			"/sitemap.xml": Record<string, never>;
			"/sponsor-us": Record<string, never>;
			"/sponsors": Record<string, never>;
			"/submit-abstract": Record<string, never>;
			"/submit-tutorial": Record<string, never>;
			"/topics": Record<string, never>;
			"/travel-grants": Record<string, never>;
			"/tutorials": Record<string, never>;
			"/venue": Record<string, never>
		};
		Pathname(): "/" | "/about/" | "/accommodation/" | "/conduct/" | "/getting-there/" | "/keynotes/" | "/organization/" | "/posters/" | "/program/" | "/program/print/" | "/register/" | "/scavenger-hunt/" | "/sitemap.xml" | "/sponsor-us/" | "/sponsors/" | "/submit-abstract/" | "/submit-tutorial/" | "/topics/" | "/travel-grants/" | "/tutorials/" | "/venue/";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/.DS_Store" | "/files/DavisCenterFloorplans.pdf" | "/files/ic2s2_2026_schedule.csv" | "/files/ic2s2_2026_word_template_tutorials.docx" | "/files/platapus.png" | "/files/program-overview.pdf" | "/files/qr_code_ic2s2_poster_poll_day_1.png" | "/files/qr_code_ic2s2_poster_poll_day_2.png" | "/files/qr_code_ic2s2_poster_poll_day_3.png" | "/files/zinnes_map.webp" | "/images/.DS_Store" | "/images/ic2s2_2026_backdrop.mp4" | "/images/ic2s2_2026_backdrop.png" | "/images/ic2s2_2026_backdrop.webm" | "/images/ic2s2_logo_black.png" | "/images/ic2s2_logo_black.svg" | "/images/ic2s2_logo_full.png" | "/images/ic2s2_logo_full_square.png" | "/images/ic2s2_logo_white.png" | "/images/keynotes/abby_andre.jpg" | "/images/keynotes/brooke-welles.jpg" | "/images/keynotes/brooke.jpg" | "/images/keynotes/derek_curry.png" | "/images/keynotes/gasper_begus.png" | "/images/keynotes/image1.png" | "/images/keynotes/image18.png" | "/images/keynotes/image19.png" | "/images/keynotes/image2.png" | "/images/keynotes/image20.png" | "/images/keynotes/image7.png" | "/images/keynotes/image8.png" | "/images/keynotes/jan_eisfeldt.jpeg" | "/images/keynotes/jennifer_gradecki.png" | "/images/keynotes/jonathan_gilmour.jpg" | "/images/keynotes/kate_starbird.png" | "/images/keynotes/katy_milkman.jpeg" | "/images/keynotes/km2.jpg" | "/images/keynotes/mirta.jpg" | "/images/keynotes/peter.jpg" | "/images/keynotes/rafael_prieto.jpg" | "/images/keynotes/timothy.png" | "/images/og-image.png" | "/images/people/Lorenzo_Lucchini_square2.png" | "/images/people/alessia_melegaro_1.jpeg" | "/images/people/alexa.jpg" | "/images/people/andi-elledge.jpg" | "/images/people/ashley-fehr.jpg" | "/images/people/brooke-welles.jpg" | "/images/people/bruno_lepri_1.jpg" | "/images/people/calla-beauregard.jpg" | "/images/people/chris.jpg" | "/images/people/debora_nozza_2.jpg" | "/images/people/duilio_balsamo_1.jpg" | "/images/people/ivana_crescenzi.jpg" | "/images/people/jaramillo.jpg" | "/images/people/jso.jpg" | "/images/people/juni.jpg" | "/images/people/kathryn-stanton.jpg" | "/images/people/km2.jpg" | "/images/people/marco-tonin.png" | "/images/people/maria.png" | "/images/people/milo-trujillo.jpg" | "/images/people/mirta-galesic.jpg" | "/images/people/peter.jpg" | "/images/people/profile_MicheleTizzoni.png" | "/images/people/raya_muttarak_1_v2.jpg" | "/images/people/tim_tangherlini.jpg" | "/images/people/timothy-tangherlini.jpg" | "/images/people/timothy-tangherlini.png" | "/images/person.svg" | "/images/sponsors/Bocconi_University_Logo.webp" | "/images/sponsors/UVM_Logo_Primary_Horiz_G.svg" | "/images/sponsors/vt_epscor.png" | "/images/tutorials/XuechunziBai.jpeg" | "/images/tutorials/ben.jpg" | "/images/tutorials/bufan.png" | "/images/tutorials/cameron_moy.avif" | "/images/tutorials/chris.jpg" | "/images/tutorials/dallas_card.jpg" | "/images/tutorials/david.jpeg" | "/images/tutorials/david_jurgens.jpeg" | "/images/tutorials/deen_freelon.avif" | "/images/tutorials/gayoung_jeon.avif" | "/images/tutorials/gayoung_jeon.jpg" | "/images/tutorials/georg.jpeg" | "/images/tutorials/gianluca.jpg" | "/images/tutorials/headshot-piccardi.jpg" | "/images/tutorials/headshot-saveski.jpg" | "/images/tutorials/indira.png" | "/images/tutorials/jason_radford.png" | "/images/tutorials/jblackbu.jpg" | "/images/tutorials/jens.png" | "/images/tutorials/jso.jpg" | "/images/tutorials/kristina.jpeg" | "/images/tutorials/markus.jpeg" | "/images/tutorials/maximilian.png" | "/images/tutorials/michael-arnold.jpg" | "/images/tutorials/nicholas_weber.jpg" | "/images/tutorials/pranav.jpeg" | "/images/tutorials/sabina_tomkins.jpg" | "/images/tutorials/scott.png" | "/images/ui/overlay.png" | "/images/ui/shadow.png" | "/images/venue/Piazza del Duomo.jpg" | "/images/venue/background_v3.mp4" | "/images/venue/bocconi.jpg" | "/images/venue/burlington.jpg" | "/images/venue/burlington_bike_path.jpg" | "/images/venue/burlington_waterfront.png" | "/images/venue/campus_2.jpg" | "/images/venue/citta.jpg" | "/images/venue/dudley_center.jpg" | "/images/venue/knowledge.jpg" | "/images/venue/uvm_campus.webp" | "/images/venue/uvm_waterman.png" | "/robots.txt" | string & {};
	}
}