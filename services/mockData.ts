
import { ServicePoint, AnimalFact } from "../types";

export const SERVICE_POINTS: ServicePoint[] = [
  // --- NORDDEUTSCHLAND ---
  { name: "Polizei Hamburg - PK 11", type: "POLICE", lat: 53.5511, lng: 9.9937, address: "Klingberg 1, 20095 Hamburg", phone: "040 4286-1110" },
  { name: "Wildtierstation Hamburg", type: "SHELTER", lat: 53.5400, lng: 10.1500, address: "Am Radeland 25, 21079 Hamburg", phone: "040 7374916" },
  { name: "Wildtierhilfe Lüneburger Heide", type: "SHELTER", lat: 53.0012, lng: 10.3245, address: "Dorfstraße 1, 29614 Soltau", phone: "05191 12345" },
  { name: "Seehundstation Friedrichskoog", type: "SHELTER", lat: 54.0044, lng: 8.8789, address: "An d. Schleuse 4, 25718 Friedrichskoog", phone: "04854 1372" },
  { name: "Polizei Kiel - Zentralrevier", type: "POLICE", lat: 54.3233, lng: 10.1228, address: "Gartenstraße 7, 24103 Kiel", phone: "0431 160-0" },
  { name: "Wildtierhilfe Bremen e.V.", type: "SHELTER", lat: 53.0793, lng: 8.8017, address: "Bremen-Nord", phone: "0421 6967737" },
  { name: "Polizei Rostock - Stadtmitte", type: "POLICE", lat: 54.0833, lng: 12.1333, address: "Ulmenstraße 54, 18057 Rostock", phone: "0381 4916-0" },
  { name: "Wildtierhilfe Vorpommern", type: "SHELTER", lat: 54.0924, lng: 13.3823, address: "Greifswald Region", phone: "03834 51234" },
  { name: "Igelhilfe Schwerin", type: "SHELTER", lat: 53.6333, lng: 11.4167, address: "Schwerin Nord", phone: "0385 123456" },
  { name: "Polizei Oldenburg", type: "POLICE", lat: 53.1434, lng: 8.2146, address: "Friedhofsweg 30, 26121 Oldenburg", phone: "0441 790-0" },

  // --- WESTDEUTSCHLAND ---
  { name: "Polizeipräsidium Köln", type: "POLICE", lat: 50.9375, lng: 6.9603, address: "Walter-Pauli-Ring 2, 51103 Köln", phone: "0221 229-0" },
  { name: "Wildvogel-Pflegestation Kirchwald", type: "SHELTER", lat: 50.3792, lng: 7.1519, address: "Auf dem Berg 1, 56729 Kirchwald", phone: "0160 96711332" },
  { name: "Wildtierhilfe Düsseldorf", type: "SHELTER", lat: 51.2277, lng: 6.7735, address: "Mörsenbroicher Weg, 40470 Düsseldorf", phone: "0211 899-0" },
  { name: "Polizei Dortmund", type: "POLICE", lat: 51.5136, lng: 7.4653, address: "Markgrafenstraße 102, 44139 Dortmund", phone: "0231 132-0" },
  { name: "Wildtierstation Frankfurt", type: "SHELTER", lat: 50.1500, lng: 8.6000, address: "Niddatal, 60488 Frankfurt", phone: "069 212-33000" },
  { name: "Polizei Essen", type: "POLICE", lat: 51.4556, lng: 7.0116, address: "Büscherstraße 2, 45131 Essen", phone: "0201 829-0" },
  { name: "Wildtierhilfe Münsterland", type: "SHELTER", lat: 51.9607, lng: 7.6261, address: "Münster Umland", phone: "0251 123456" },
  { name: "Greifvogelstation Hellenthal", type: "SHELTER", lat: 50.4900, lng: 6.4300, address: "Wildfreigehege 1, 53940 Hellenthal", phone: "02482 7240" },
  { name: "Polizei Mainz", type: "POLICE", lat: 50.0000, lng: 8.2667, address: "Valeristraße 2, 55118 Mainz", phone: "06131 65-0" },
  { name: "Wildtierauffangstation Saarland", type: "SHELTER", lat: 49.3000, lng: 6.9000, address: "Püttlingen", phone: "06806 930-0" },
  { name: "Polizei Koblenz", type: "POLICE", lat: 50.3569, lng: 7.5890, address: "Moselring 10, 56068 Koblenz", phone: "0261 103-0" },

  // --- OSTDEUTSCHLAND ---
  { name: "Polizei Berlin - Mitte", type: "POLICE", lat: 52.5200, lng: 13.4050, address: "Platz der Luftbrücke 6, 12101 Berlin", phone: "030 4664-0" },
  { name: "Eichhörnchen-Notruf Berlin", type: "SHELTER", lat: 52.4500, lng: 13.3500, address: "Berlin-Zehlendorf", phone: "0700 34244677" },
  { name: "Wildtierauffangstation Dresden", type: "SHELTER", lat: 51.0504, lng: 13.7373, address: "An der Elbaue, 01067 Dresden", phone: "0351 4880" },
  { name: "Polizei Leipzig", type: "POLICE", lat: 51.3397, lng: 12.3731, address: "Dimitroffstraße 1, 04107 Leipzig", phone: "0341 966-0" },
  { name: "Naturwacht Brandenburg", type: "SHELTER", lat: 52.4100, lng: 12.5500, address: "Brandenburg a.d.H.", phone: "03381 410200" },
  { name: "Polizei Potsdam", type: "POLICE", lat: 52.3989, lng: 13.0657, address: "Henning-von-Tresckow-Straße 9, 14467 Potsdam", phone: "0331 5508-0" },
  { name: "Wildtierhilfe Magdeburg", type: "SHELTER", lat: 52.1307, lng: 11.6289, address: "Magdeburg Süd", phone: "0391 123456" },
  { name: "Polizei Halle (Saale)", type: "POLICE", lat: 51.4828, lng: 11.9697, address: "Merseburger Straße 6, 06110 Halle", phone: "0345 224-0" },
  { name: "Wildtierstation Erfurt", type: "SHELTER", lat: 50.9787, lng: 11.0328, address: "Erfurt West", phone: "0361 123456" },
  { name: "Polizei Cottbus", type: "POLICE", lat: 51.7563, lng: 14.3329, address: "Juri-Gagarin-Straße 15, 03046 Cottbus", phone: "0355 4937-0" },

  // --- SÜDDEUTSCHLAND ---
  { name: "Polizeipräsidium München", type: "POLICE", lat: 48.1351, lng: 11.5820, address: "Ettstraße 2, 80333 München", phone: "089 2910-0" },
  { name: "Igelstation München", type: "SHELTER", lat: 48.1500, lng: 11.5000, address: "Nymphenburg, 80638 München", phone: "089 987654" },
  { name: "Polizeirevier Stuttgart-Mitte", type: "POLICE", lat: 48.7758, lng: 9.1829, address: "Theodor-Heuss-Straße 11, 70174 Stuttgart", phone: "0711 8990-3100" },
  { name: "Wildtierhilfe Stuttgart", type: "SHELTER", lat: 48.8000, lng: 9.2000, address: "Stuttgart-Bad Cannstatt", phone: "0711 1234567" },
  { name: "Wildtierstation Karlsruhe", type: "SHELTER", lat: 49.0069, lng: 8.4037, address: "Hermann-Veit-Straße 2, 76135 Karlsruhe", phone: "0721 133-3790" },
  { name: "Polizei Nürnberg", type: "POLICE", lat: 49.4521, lng: 11.0767, address: "Richard-Wagner-Platz 1, 90443 Nürnberg", phone: "0911 2112-0" },
  { name: "Wildtierhilfe Augsburg", type: "SHELTER", lat: 48.3705, lng: 10.8978, address: "Holzweg 2, 86156 Augsburg", phone: "0821 324-0" },
  { name: "Polizei Regensburg", type: "POLICE", lat: 49.0134, lng: 12.1016, address: "Minoritenweg 1, 93047 Regensburg", phone: "0941 506-0" },
  { name: "Wildtierhilfe Oberpfalz", type: "SHELTER", lat: 49.3000, lng: 12.0000, address: "Schwandorf Region", phone: "09431 12345" },
  { name: "Polizei Würzburg", type: "POLICE", lat: 49.7913, lng: 9.9533, address: "Augustinerstraße 24, 97070 Würzburg", phone: "0931 457-0" },
  { name: "Wildtierhilfe Freiburg", type: "SHELTER", lat: 47.9990, lng: 7.8421, address: "Freiburg im Breisgau", phone: "0761 123456" },
  { name: "Polizei Ulm", type: "POLICE", lat: 48.3984, lng: 9.9915, address: "Münsterplatz 47, 89073 Ulm", phone: "0731 188-0" },
  { name: "Greifvogelstation am Bodensee", type: "SHELTER", lat: 47.6631, lng: 9.4754, address: "Friedrichshafen", phone: "07541 12345" },
  { name: "Polizei Garmisch-Partenkirchen", type: "POLICE", lat: 47.4921, lng: 11.0861, address: "Hauptstraße 4, 82467 Garmisch-P.", phone: "08821 917-0" },
  { name: "Wildtierauffangstation Bayreuth", type: "SHELTER", lat: 49.9456, lng: 11.5713, address: "Bayreuth Nord", phone: "0921 123456" },
  { name: "Polizei Passau", type: "POLICE", lat: 48.5748, lng: 13.4609, address: "Nibelungenstraße 17, 94032 Passau", phone: "0851 9511-0" },

  // --- SPEZIALISIERTE BUNDESWEITE NOTRUFE (Als Fallback) ---
  { name: "Zentraler Eichhörnchen Notruf", type: "SHELTER", lat: 50.1109, lng: 8.6821, address: "Bundesweit erreichbar", phone: "0700 34244677" },
  { name: "Fledermaus-Nottelefon (NABU)", type: "SHELTER", lat: 52.5200, lng: 13.4050, address: "Bundesweit (Berlin Sitz)", phone: "030 284984-5000" },
  { name: "Wildvogelhilfe Deutschland", type: "SHELTER", lat: 51.1657, lng: 10.4515, address: "Online-Netzwerk / Notfall", phone: "0176 12345678" }
];

export const ANIMAL_FACTS: Record<string, AnimalFact> = {
  "Reh": {
    name: "Reh (Capreolus capreolus)",
    description: "Die kleinste Hirschart Europas. Sehr scheu und dämmerungsaktiv.",
    habitat: "Waldränder, Lichtungen, Kulturlandschaften.",
    diet: "Kräuter, Gräser, junge Knospen.",
    funFact: "Rehe 'bellen' bei Gefahr fast wie Hunde.",
    furColor: "Sommer: rötlich-braun; Winter: graubraun.",
    characteristics: "Weißer Fleck am Po (Spiegel), schwarze Nase."
  },
  "Wildschwein": {
    name: "Wildschwein (Sus scrofa)",
    description: "Intelligent, wehrhaft und extrem anpassungsfähig.",
    habitat: "Wälder, zunehmend auch städtische Randgebiete.",
    diet: "Allesfresser (Wurzeln, Eicheln, Kleintiere).",
    funFact: "Sie können bis zu 40 km/h schnell rennen.",
    furColor: "Dunkelbraun bis Schwarz, borstig.",
    characteristics: "Starke Eckzähne (Waffen), langer Rüssel (Gebrechen)."
  },
  "Fuchs": {
    name: "Rotfuchs (Vulpes vulpes)",
    description: "Der kluge Überlebenskünstler unserer Kulturlandschaft.",
    habitat: "Überall, vom Wald bis in den Garten.",
    diet: "Mäuse, Vögel, Obst, Speisereste.",
    funFact: "Füchse haben senkrechte Pupillen, genau wie Katzen.",
    furColor: "Rostrot, weißer Bauch und Schwanzspitze.",
    characteristics: "Buschiger Schwanz (Lunte), spitze Ohren."
  },
  "Igel": {
    name: "Braunbrustigel (Erinaceus europaeus)",
    description: "Nachtaktiver Insektenfresser mit markantem Stachelkleid.",
    habitat: "Gärten, Hecken, lichte Wälder.",
    diet: "Käfer, Larven, Regenwürmer.",
    funFact: "Igel sind immun gegen viele Schlangengifte.",
    furColor: "Braune Stacheln mit hellen Spitzen.",
    characteristics: "Kugelbildung bei Gefahr, spitze Schnauze."
  },
  "Eichhörnchen": {
    name: "Eichhörnchen (Sciurus vulgaris)",
    description: "Flinke Kletterkünstler, die Vorräte für den Winter anlegen.",
    habitat: "Wälder, Parks, Gärten.",
    diet: "Nüsse, Samen, Knospen, gelegentlich Eier.",
    funFact: "Sie vergessen oft, wo sie ihre Nüsse vergraben haben – so pflanzen sie neue Bäume.",
    furColor: "Fuchsiarot bis Schwarzbraun.",
    characteristics: "Puschelschwanz, Haarpinsel an den Ohren."
  },
  "Feldhase": {
    name: "Feldhase (Lepus europaeus)",
    description: "Deutlich größer als Wildkaninchen, sehr lange Ohren mit schwarzen Spitzen.",
    habitat: "Offene Landschaften, Äcker, Wiesen.",
    diet: "Pflanzenfresser (Gräser, Kräuter, Feldfrüchte).",
    funFact: "Hasen schlafen oft mit offenen Augen, um Feinde frühzeitig zu bemerken.",
    furColor: "Gelblich-grau bis rötlich-braun.",
    characteristics: "Lange Hinterbeine (Fluchttier), Löffel länger als der Kopf."
  },
  "Dachs": {
    name: "Dachs (Meles meles)",
    description: "Größter heimischer Marder, markant durch schwarz-weißes Gesicht.",
    habitat: "Laubmischwälder mit tiefem Boden für weitverzweigte Bauten.",
    diet: "Allesfresser (Regenwürmer, Obst, Wurzeln, Insekten).",
    funFact: "Dachse sind extrem reinliche Tiere und legen 'Toiletten' außerhalb ihres Baues an.",
    furColor: "Silbergrau-schwarz meliert.",
    characteristics: "Gedrungener Körper, kräftige Grabpfoten mit Krallen."
  },
  "Steinmarder": {
    name: "Steinmarder (Martes foina)",
    description: "Anpassungsfähiger Kletterkünstler, oft in der Nähe von Menschen.",
    habitat: "Wohngebiete, Scheunen, Dachböden, Waldränder.",
    diet: "Allesfresser (Eier, Früchte, Kleinsäuger).",
    funFact: "Steinmarder können bis zu 2 Meter weit springen und senkrechte Wände erklimmen.",
    furColor: "Braungrau mit markantem weißem Kehlfleck.",
    characteristics: "Weißer, oft gegabelter Kehlfleck, fleischfarbene Nase."
  }
};
