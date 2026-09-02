export interface MunicipalityData {
  name: string;
  barangays: string[];
}

export interface ProvinceData {
  name: string;
  municipalities: MunicipalityData[];
}

export interface RegionData {
  region: string;
  provinces: ProvinceData[];
}

export const PHILIPPINE_LOCATIONS: RegionData[] = [
  // ─── 1. NCR ────────────────────────────────────────────────────────────────
  {
    region: 'NCR - National Capital Region',
    provinces: [
      {
        name: 'Metro Manila',
        municipalities: [
          { name: 'City of Manila', barangays: ['Barangay 659 (Intramuros)', 'Barangay 670 (Ermita)', 'Barangay 701 (Malate)', 'Barangay 306 (Quiapo)', 'Barangay 281 (Binondo)', 'Barangay 412 (Sampaloc)', 'Barangay 501 (Tondo)', 'Barangay 801 (Paco)', 'Barangay 890 (Santa Ana)'] },
          { name: 'Quezon City', barangays: ['Batasan Hills', 'Commonwealth', 'Cubao (Socorro)', 'Diliman (U.P. Campus)', 'Kamuning', 'Loyola Heights', 'Novaliches Proper', 'Tandang Sora', 'Project 4', 'Holy Spirit', 'Payatas', 'Bagong Silangan', 'Fairview', 'Pasong Tamo'] },
          { name: 'Caloocan City', barangays: ['Bagong Silang (Brgy. 176)', 'Camarin (Brgy. 178)', 'Deparo', 'Grace Park East', 'Grace Park West', 'Llano', 'Maypajo', 'Tala', 'Bagumbong'] },
          { name: 'Las Piñas City', barangays: ['Almanza Uno', 'Almanza Dos', 'BF Homes', 'Daniel Fajardo', 'Pilar', 'Pulang Lupa Uno', 'Pulang Lupa Dos', 'Talon Uno', 'Talon Dos', 'Zapote'] },
          { name: 'Makati City', barangays: ['Bel-Air', 'Dasmariñas', 'Forbes Park', 'Poblacion', 'San Lorenzo', 'Urdaneta', 'West Rembo', 'Cembo', 'Comembo', 'Pio del Pilar', 'Bangkal'] },
          { name: 'Malabon City', barangays: ['Acacia', 'Baritan', 'Binyakan', 'Catmon', 'Concepcion', 'Longos', 'Muzon', 'Panghulo', 'San Agustin', 'Tañong', 'Tinajeros'] },
          { name: 'Mandaluyong City', barangays: ['Addition Hills', 'Barangka Drive', 'Hagdan Bato Libis', 'Highway Hills', 'Mauway', 'Plainview', 'Pleasant Hills', 'San Jose', 'Wack-Wack Greenhills'] },
          { name: 'Marikina City', barangays: ['Barangka', 'Concepcion Uno', 'Concepcion Dos', 'Fortune', 'Industrial Valley', 'Jesus dela Peña', 'Malanday', 'Marikina Heights', 'Nangka', 'Parang', 'Tañong'] },
          { name: 'Muntinlupa City', barangays: ['Alabang', 'Bayanan', 'Buli', 'Cupang', 'Poblacion', 'Putatan', 'Sucat', 'Tunasan'] },
          { name: 'Navotas City', barangays: ['Bagumbayan Norte', 'Bagumbayan Sur', 'Bangculasi', 'Daanghari', 'Navotas West', 'Navotas East', 'San Jose', 'San Roque', 'Sipac-Almacen', 'Tangos'] },
          { name: 'Parañaque City', barangays: ['BF Homes', 'Baclaran', 'Don Bosco', 'Don Galo', 'La Huerta', 'Marcelo Green', 'Merville', 'Moonwalk', 'San Antonio', 'San Dionisio', 'Sun Valley', 'Tambo'] },
          { name: 'Pasay City', barangays: ['Barangay 1', 'Barangay 30', 'Barangay 76 (Libertad)', 'Barangay 183', 'Malibay', 'Maricaban', 'San Jose', 'Villamor Air Base'] },
          { name: 'Pasig City', barangays: ['Bambang', 'Caniogan', 'Kapitolyo', 'Manggahan', 'Maybunga', 'Oranbo', 'Pinagbuhatan', 'Rosario', 'San Antonio', 'San Joaquin', 'San Nicolas', 'Santa Lucia', 'Ugong'] },
          { name: 'Pateros', barangays: ['Aguho', 'Aling Barang', 'Ambulong', 'Bayanan', 'Martirez del 96', 'Poblacion', 'San Pedro', 'San Roque', 'Santa Ana', 'Tabacalera'] },
          { name: 'San Juan City', barangays: ['Addition Hills', 'Balong-Bato', 'Batis', 'Corazon de Jesus', 'Greenhills', 'Kabayanan', 'Little Baguio', 'Maytunas', 'Progreso', 'Sta. Lucia', 'Tibagan'] },
          { name: 'Taguig City', barangays: ['Bagumbayan', 'Bambang', 'Calzada', 'Fort Bonifacio (BGC)', 'Ibayo-Tipas', 'Ligid-Tipas', 'Lower Bicutan', 'New Lower Bicutan', 'Upper Bicutan', 'Pinagsama', 'Signal Village', 'Tuktukan', 'Ususan', 'Western Bicutan'] },
          { name: 'Valenzuela City', barangays: ['Arkong Bato', 'Balangkas', 'Bignay', 'Bisig', 'Canumay East', 'Canumay West', 'Dalandanan', 'Gen. T. de Leon', 'Karuhatan', 'Lawang Bato', 'Lingunan', 'Malanday', 'Malinta', 'Mapulang Lupa', 'Paso de Blas', 'Poblacion', 'Punturin', 'Ulingan'] },
        ],
      },
    ],
  },

  // ─── 2. CAR ────────────────────────────────────────────────────────────────
  {
    region: 'CAR - Cordillera Administrative Region',
    provinces: [
      {
        name: 'Abra',
        municipalities: [
          { name: 'Bangued', barangays: ['Agtangao', 'Angad', 'Balawag', 'Belen', 'Bengcag', 'Calaba', 'Cosili East', 'Cosili West', 'Lingtan', 'Macray', 'Poblacion', 'San Antonio', 'Zone 1 to 7'] },
          { name: 'Bucay', barangays: ['Abang', 'Bangcagan', 'Banglolao', 'Bugbog', 'Calao', 'Dugong', 'Labon', 'LAYUGA', 'Poblacion', 'Salnec', 'Tugot'] },
          { name: 'Dolores', barangays: ['Balaang', 'Bulalacao', 'Cabaroan', 'Isit', 'Kimmalaba', 'Libtec', 'Lub-lubba', 'Mabato', 'Poblacion', 'Salucag', 'Talavera'] },
          { name: 'La Paz', barangays: ['Benaben', 'Bulbulala', 'Canan', 'Langden', 'Poblacion', 'San Gregorio', 'Toon', 'Ududdiao'] },
          { name: 'Manabo', barangays: ['Catacdeangan Norte', 'Catacdeangan Sur', 'Luzong', 'San Jose Norte', 'San Jose Sur', 'San Juan Norte', 'San Juan Sur', 'San Ramon'] },
          { name: 'Peñarrubia', barangays: ['Dumayco', 'Lusuac', 'Malamsit', 'Poblacion', 'Riang', 'Santa Rosa', 'Tebell'] },
          { name: 'Pidigan', barangays: ['Arab', 'Garreta', 'Gayaman', 'Induyong', 'Laskig', 'Naguirayan', 'Poblacion', 'San Jose', 'Sulbec', 'Yuyeng'] },
          { name: 'San Juan', barangays: ['Abang', 'Ba-ug', 'Bila-bila', 'Culliong', 'Dao-angan', 'Poblacion', 'Quidaoen', 'Sabaggoc'] },
          { name: 'Tayum', barangays: ['Bagalay', 'Basbasa', 'Budac', 'Bumagcat', 'Gaddani', 'Poblacion', 'Tuley', 'Vargas'] },
        ],
      },
      {
        name: 'Apayao',
        municipalities: [
          { name: 'Calanasan', barangays: ['Eleazar', 'Eva', 'Kabugao', 'Langnao', 'Nabuangan', 'Poblacion', 'Sabangan', 'Santa Filomena', 'Tubangan'] },
          { name: 'Conner', barangays: ['Allangigan', 'Buluan', 'Caglayan', 'Calafug', 'Cupis', 'Daga', 'Guinaang', 'Guimbungan', 'Illuru', 'Manag', 'Nawabu', 'Poblacion', 'Ripang', 'Sacpil'] },
          { name: 'Flora', barangays: ['Allig', 'Anninipan', 'Atok', 'Bagutong', 'Balagbag', 'Malubibit Norte', 'Malubibit Sur', 'Poblacion East', 'Poblacion West', 'San Luis', 'Santa Maria'] },
          { name: 'Kabugao', barangays: ['Badduat', 'Baliwanan', 'Bulu', 'Dagara', 'Laco', 'Lenneng', 'Lucab', 'Luttuacan', 'Madatag', 'Madduang', 'Poblacion', 'Wangan'] },
          { name: 'Luna', barangays: ['Bacsay', 'Capagaypayan', 'Dagupan', 'Lappa', 'Luac', 'Marag', 'Poblacion', 'San Isidro', 'San Luis', 'Santa Teresita', 'Shalom'] },
          { name: 'Pudtol', barangays: ['Aga', 'Alepao', 'Caburowan', 'Cacalugawan', 'Doña Loreta', 'Emilia', 'Lower Maton', 'Malibang', 'Poblacion', 'San Antonio', 'San Jose', 'Swan', 'Upper Maton'] },
          { name: 'Santa Marcela', barangays: ['Baroc', 'Cristina', 'Emiliana', 'Marcelo', 'Poblacion', 'San Carlos', 'San Juan', 'San Mariano', 'Santa Maria', 'Zamora'] },
        ],
      },
      {
        name: 'Benguet',
        municipalities: [
          { name: 'Baguio City', barangays: ['Camp 7', 'Irisan', 'Loakan Proper', 'Pacdal', 'Session Road Area (Poblacion)', 'Trancoville', 'Country Club Village', 'Engineer\'s Hill', 'Asin Road', 'Bakakeng North', 'Gibraltar', 'Magsaysay Ave'] },
          { name: 'Atok', barangays: ['Abatan', 'Ambuclao', 'Caliking', 'Cattubo', 'Nalbengan', 'Poblacion', 'Paoay', 'Pasdong', 'Topdak'] },
          { name: 'Bakun', barangays: ['Ampusongan', 'Bagu', 'Dalipey', 'Gambang', 'Kayapa', 'Poblacion', 'Sinacbat'] },
          { name: 'Bokod', barangays: ['Ambuclao', 'Bila', 'Bobok-Bisal', 'Daclan', 'Ekip', 'Guiting', 'Karao', 'Nawal', 'Pito', 'Poblacion'] },
          { name: 'Buguias', barangays: ['Abatan', 'Amamdao', 'Baculongan North', 'Baculongan Sur', 'Calamagan', 'Catlobong', 'Loo', 'Natan', 'Poblacion', 'Sebang'] },
          { name: 'Itogon', barangays: ['Ampucao', 'Dalupirip', 'Gumatdang', 'Loacan', 'Poblacion', 'Tuba', 'Ucab', 'Virac'] },
          { name: 'Kabayan', barangays: ['Adaoay', 'Anchohey', 'Bachi', 'Ballay', 'Bashoy', 'Bawer', 'Duacan', 'Edaño', 'Kibungan', 'Poblacion', 'Salaking'] },
          { name: 'Kapangan', barangays: ['Balakbak', 'Beleng-Belis', 'Boklaoan', 'Central', 'Datacan', 'Gadang', 'Labueg', 'Paykek', 'Poblacion', 'Pudong', 'Taba-ao'] },
          { name: 'La Trinidad', barangays: ['Ambiong', 'Balili', 'Beckel', 'Betag', 'Cruz', 'Pico', 'Poblacion', 'Puguis', 'Shilan', 'Tawang', 'Wangal'] },
          { name: 'Mankayan', barangays: ['Balili', 'Bedbed', 'Bulalacao', 'Cabiten', 'Colalo', 'Guinaoang', 'Poblacion', 'Tabio', 'Taneg'] },
          { name: 'Sablan', barangays: ['Bagong', 'Balluay', 'Banangan', 'Banengbeng', 'Kamog', 'Papa', 'Poblacion'] },
          { name: 'Tuba', barangays: ['Camp 1', 'Camp 3', 'Camp 4', 'Nangalisan', 'Poblacion', 'San Pascual', 'Tabaan Sur', 'Tadiangan', 'Taloy Sur'] },
          { name: 'Tublay', barangays: ['Ambassador', 'Ambongdolan', 'Ba-ayan', 'Caponga', 'Poblacion', 'Tuel', 'Tublay Central'] },
        ],
      },
      {
        name: 'Ifugao',
        municipalities: [
          { name: 'Aguinaldo', barangays: ['Awayan', 'Bunhian', 'Damag', 'Halag', 'Itab', 'Jacmal', 'Majawjaw', 'Monggayang', 'Posnaan', 'Ta-ang'] },
          { name: 'Alfonso Lista', barangays: ['Banghalaan', 'Busilac', 'Calupaan', 'Catarawan', 'Dolowog', 'Kiling', 'Namillangan', 'Poblacion', 'Pinto', 'San Jose', 'San Marcos', 'Santa Maria'] },
          { name: 'Asipulo', barangays: ['Ambagowac', 'Awa', 'Camendang', 'Cawayan', 'Haliap', 'Panubtuban', 'Pula'] },
          { name: 'Banaue', barangays: ['Amganad', 'Anaba', 'Bangaan', 'Batad', 'Bocos', 'Gohang', 'Kinakin', 'Poblacion', 'Poitan', 'San Fernando', 'Tam-an'] },
          { name: 'Hingyon', barangays: ['Anao', 'Bangtinon', 'Bitu', 'Cababuyan', 'Humid', 'O-ong', 'Piwong', 'Poblacion', 'Ulbikon'] },
          { name: 'Hungduan', barangays: ['Abatan', 'Bangan', 'Magok', 'Poblacion', 'Poblacion Sur', 'Ukoh'] },
          { name: 'Kiangan', barangays: ['Ambabag', 'Bolog', 'Bokiawan', 'Duit', 'Hucab', 'Lingay', 'Nagacadan', 'Poblacion', 'Pindongan', 'Tuplac'] },
          { name: 'Lagawe', barangays: ['Abinuan', 'Banga', 'Boliwong', 'Burnay', 'Buyabuyan', 'CUDOG', 'Montabiong', 'Nunggawa', 'Poblacion East', 'Poblacion West', 'Tungngod'] },
          { name: 'Lamut', barangays: ['Ambabag', 'Dugong', 'Hapid', 'Lawig', 'Magulon', 'Nayon', 'Pieza', 'Poblacion', 'Pugol', 'Sanafe', 'Umpug'] },
          { name: 'Mayoyao', barangays: ['Aduyongan', 'Alimit', 'Baya', 'Bongan', 'Chumang', 'Guinihang', 'Inwaloy', 'Maple', 'Poblacion', 'Tulaed'] },
          { name: 'Tinoc', barangays: ['Ahin', 'Ap-ap', 'Binablayan', 'Danggo', 'Gumahang', 'Luhong', 'Poblacion', 'Tulludan', 'Wangwang'] },
        ],
      },
      {
        name: 'Kalinga',
        municipalities: [
          { name: 'Balbalan', barangays: ['Ab-abaan', 'Balbalan Proper', 'Balbalasang', 'Buaya', 'Cagaluan', 'Dao-angan', 'Gabu', 'Mabaca', 'Magsilay', 'Poswoy', 'Talalang'] },
          { name: 'Lubuagan', barangays: ['Dangoy', 'LOWER Kalinga', 'Mabaca', 'Magsilay', 'Poblacion', 'Poswoy', 'Tanglag', 'Upper Lubuagan'] },
          { name: 'Pasil', barangays: ['Ableg', 'Balinciagao Norte', 'Balinciagao Sur', 'Cagaluan', 'Colayo', 'Gawaan', 'Guina-ang', 'Malucsang', 'Pugong', 'Uma'] },
          { name: 'Pinukpuk', barangays: ['Acero', 'Ammacian', 'Apatan', 'Bwag', 'Camalog', 'Cawagayan', 'Dugpa', 'Katabbogan', 'Limos', 'Mapaco', 'Poblacion', 'Taggay'] },
          { name: 'Rizal', barangays: ['Babalag East', 'Babalag West', 'Calaocan', 'Liwan East', 'Liwan West', 'Macutay', 'San Bulanao', 'San Pedro'] },
          { name: 'Tabuk City', barangays: ['Agbannawag', 'Appas', 'Bado Dangwa', 'Bulanao Norte', 'Bulanao Sur', 'Calaccad', 'Casigayan', 'Cudal', 'Dagupan Center', 'Laya East', 'Laya West', 'Lucog', 'Magnao', 'Nambaran', 'New Tinglayan', 'San Juan'] },
          { name: 'Tanudan', barangays: ['Anggacan', 'Bawac', 'Dacalan', 'Gaang', 'Lay-asan', 'Luwacan', 'Mabangtot', 'Poblacion', 'Taloctoc'] },
          { name: 'Tinglayan', barangays: ['Ambato Legleg', 'Bangad Centro', 'Basao', 'Bugnay', 'Buscalan', 'Luplupa', 'Mallango', 'Ngibat', 'Poblacion', 'Tulgao East', 'Tulgao West'] },
        ],
      },
      {
        name: 'Mountain Province',
        municipalities: [
          { name: 'Barlig', barangays: ['Chatol', 'Fiangtin', 'Gawana (Poblacion)', 'Latang', 'Lias Silangan', 'Lias Kanluran', 'Lingoy', 'Macalana'] },
          { name: 'Bauko', barangays: ['Abatan', 'Bagnen Oriente', 'Bagnen Proper', 'Bila', 'Leseb', 'Mayag', 'Monamon Norte', 'Monamon Sur', 'Otucan Norte', 'Poblacion', 'Suyo'] },
          { name: 'Besao', barangays: ['Agawa', 'Ambaguio', 'Baking', 'Besao East', 'Besao West', 'Catengan', 'Gueday', 'Kiniway', 'Laylaya', 'Padangangan', 'Paiang', 'Tamboan'] },
          { name: 'Bontoc', barangays: ['Alab Oriente', 'Alab Proper', 'Bontoc Ili', 'Caluttit', 'Dalican', 'Gonogon', 'Guinaang', 'Mainit', 'Maligcong', 'Poblacion', 'Samoki', 'Tocucan'] },
          { name: 'Natonin', barangays: ['Alunogan', 'Balangao', 'Banao', 'Banawel', 'Boliwong', 'Maducayan', 'Poblacion', 'Saliok', 'Sta. Isabel'] },
          { name: 'Paracelis', barangays: ['Anonat', 'Bantay', 'Butigue', 'Bunot', 'Palali', 'Poblacion', 'Poblacion Bottom', 'BUNOT'] },
          { name: 'Sabangan', barangays: ['Bao-angan', 'Bun-ayan', 'Camatagan', 'Data', 'Gayang', 'Lagan', 'Losad', 'Namatec', 'Poblacion', 'Pingad', 'Supang'] },
          { name: 'Sadanga', barangays: ['Anabel', 'Belwang', 'Beti', 'Poblacion', 'Sacasacan', 'Saclit'] },
          { name: 'Sagada', barangays: ['Aguid', 'Ambasing', 'Ankileng', 'Antadao', 'Bangaan', 'Dagdag', 'Demang', 'Fidelisan', 'Kiltepan', 'Madamay', 'Poblacion', 'Pide', 'Tanulong'] },
          { name: 'Tadian', barangays: ['Balaoa', 'Banaao', 'Bantey', 'Batayan', 'Bila', 'Cadad-anan', 'Cagubatan', 'Dacudac', 'Kayan East', 'Kayan West', 'LUbon', 'Mabalite', 'Poblacion', 'Pandayan', 'TUE'] },
        ],
      },
    ],
  },

  // ─── 3. Region I ────────────────────────────────────────────────────────────
  {
    region: 'Region I - Ilocos Region',
    provinces: [
      {
        name: 'Ilocos Norte',
        municipalities: [
          { name: 'Laoag City', barangays: ['San Fernando (Poblacion)', 'Santa Angela', 'Nuestra Señora de Natividad', 'San Jose', 'Nalbo', 'Brgy. 1-A', 'Brgy. 2', 'Brgy. 6', 'Brgy. 17', 'Cavit', 'Dibua', 'Mangato'] },
          { name: 'Batac City', barangays: ['Ablan', 'Boon', 'Bungon', 'Caunayan', 'Lacub', 'Libtong', 'Nagbacalan', 'Poblacion', 'Quiling Norte', 'Quiling Sur', 'Tabug', 'Val Valdez'] },
          { name: 'Bacarra', barangays: ['Bani', 'Bebot', 'Cabulalaan', 'Cadaratan', 'Corocor', 'Duripes', 'Nalasin', 'Poblacion', 'Santa Rita', 'Tungao'] },
          { name: 'Badoc', barangays: ['Alay-Nabuang', 'Ar-arusip', 'Aring', 'Balbaldez', 'Bato', 'Carot', 'Gabu', 'Nagrebcan', 'PAGSANAHAN', 'Poblacion 1 to 4', 'Santa Cruz'] },
          { name: 'Bangui', barangays: ['Abaca', 'Bacsil', 'Banban', 'Baruyen', 'Dadaor', 'Lanao', 'Malasin', 'Manayon', 'Poblacion', 'Taguiporo'] },
          { name: 'Burgos', barangays: ['Ablan', 'Agora', 'Bobon', 'Buduan', 'Nagsurot', 'Paayas', 'PAGALI', 'Poblacion', 'Tanap'] },
          { name: 'Carasi', barangays: ['Angsannaan', 'Barangay 1 (Poblacion)', 'Barangay 2', 'Barangay 3'] },
          { name: 'Currimao', barangays: ['Angora', 'BOMBIT', 'Cabugao', 'Gaang', 'Lang-ayan', 'Lioes', 'Maglaoi Centro', 'Maglaoi Norte', 'Maglaoi Sur', 'Poblacion 1 & 2', 'Salugan', 'Subec', 'Torres'] },
          { name: 'Dingras', barangays: ['Albano', 'Baresbes', 'Bungcag', 'Cali', 'Dancel', 'Foz', 'Guerrero', 'Lazo', 'Madamba', 'Poblacion 1 to 3', 'San Esteban', 'San Marcelino', 'San Rafael', 'Ver'] },
          { name: 'Dumalneg', barangays: ['Dumalneg (Poblacion)', 'Kalaw', 'Quibel'] },
          { name: 'Marcos', barangays: ['Alabug', 'Calaitingan', 'Escoda', 'Ferdinand', 'Fortuna', 'Pacifico', 'Poblacion', 'Santiago', 'Tabtabagan', 'Valdez'] },
          { name: 'Nueva Era', barangays: ['Acapan', 'Cabarittan', 'Caray', 'Garnaden', 'Nagugungan', 'Poblacion', 'Santo Niño', 'Uguis'] },
          { name: 'Pagudpud', barangays: ['Aggasi', 'Baduang', 'Balaoi', 'Burayoc', 'Caparispisan', 'Ligaya', 'Poblacion 1', 'Poblacion 2', 'Saud', 'Subec'] },
          { name: 'Paoay', barangays: ['Bacsil', 'Cabangaran', 'Callaguip', 'Cayubog', 'Dolores', 'Nagbacalan', 'Nangacasan', 'Poblacion', 'Suba', 'Visaya'] },
          { name: 'Pasuquin', barangays: ['Bagsabag', 'Carusipan', 'Dilavo', 'Estancia', 'Nagsanga', 'Nalvo', 'Poblacion 1 to 4', 'Salwacing', 'Santa Maria', 'Sulbec', 'TADAO'] },
          { name: 'Piddig', barangays: ['Anao', 'Callusa', 'Gayamat', 'Maruaya', 'Poblacion 1 & 2', 'San Antonio', 'Santa Maria', 'Sucsuquen'] },
          { name: 'Pinili', barangays: ['Badio', 'Buata', 'Bulbulala', 'Cabaroan', 'Lapon', 'PAGDILAO', 'Poblacion', 'Puritac', 'Sacritan', 'Valbuena'] },
          { name: 'San Nicolas', barangays: ['Bingao', 'Catuguing', 'San Agostino', 'San Baltazar', 'San Francisco', 'San Hilario', 'San Jose', 'San Paulo', 'San Pedro', 'Santa Cecilia'] },
          { name: 'Sarrat', barangays: ['San Andres', 'San Antonio', 'San Cristobal', 'San Felipe', 'San Jose', 'San Juan', 'San Lorenzo', 'San Manuel', 'San Nicolas', 'San Pedro', 'San Roque', 'Santa Barbara', 'Santa Isabel'] },
          { name: 'Solsona', barangays: ['Agpay', 'Bagnonos', 'Barcelona', 'Aguitap', 'Capurictan', 'La-o', 'Poblacion 1 & 2', 'San Juan', 'San Lorenzo', 'Santa Maria'] },
          { name: 'Vintar', barangays: ['Abakir', 'Bacan', 'Cabusligan', 'Columbia', 'Dipilat', 'Ester', 'Lubnac', 'Mabanbanag', 'Poblacion 1 to 5', 'Salsalamagui', 'Tamdagan', 'Visaya'] },
        ],
      },
      {
        name: 'Ilocos Sur',
        municipalities: [
          { name: 'Vigan City', barangays: ['Ayusan Norte', 'Ayusan Sur', 'Barangay I (Poblacion)', 'Barangay II', 'Barangay III', 'Barangay IV', 'Barangay V', 'Barangay VI', 'Mindoro', 'Nagsangalan', 'Raois', 'Rizal', 'Tamag'] },
          { name: 'Candon City', barangays: ['Bagani Camposanto', 'Bagani Gabor', 'Bagani Tocotoc', 'Calongbuyan', 'Catarman', 'Darapidap', 'Langlangca 1st', 'Langlangca 2nd', 'Payas', 'Poblacion', 'San Jose', 'Talogtog'] },
          { name: 'Bantay', barangays: ['Aggay', 'Anzures', 'Balaleng', 'Cabaroan', 'Mira', 'Pagsanan', 'Poblacion', 'San Giuliano', 'San Mariano', 'San Vicente', 'Zapatos'] },
          { name: 'Cabugao', barangays: ['Alinaay', 'Bacilig', 'Cabilaoan', 'Dardarat', 'Lipit', 'Poblacion 1 to 4', 'Salomague', 'San Antonio', 'Turod'] },
          { name: 'Caoayan', barangays: ['Anonang Mayor', 'Anonang Menor', 'Baggoc', 'Callaguip', 'Don Alejandro Quirolgico', 'Don Dimas Querubin', 'Fante', 'Manabay', 'Purok-purok', 'Villamar'] },
          { name: 'Magsingal', barangays: ['Baluarte', 'Bangar', 'Cabaroan', 'Cadassaan', 'Marana', 'Poblacion 1 to 4', 'San Clemente', 'San Julian', 'San Ramon', 'Santa Monica'] },
          { name: 'Narvacan', barangays: ['Abuor', 'Bantay', 'Bulanos', 'Cagayungan', 'Camestizoan', 'Lungog', 'OBUOR', 'Poblacion', 'Quinarayan', 'San Jose', 'Sulvec', 'Turod'] },
          { name: 'Santa', barangays: ['Banaoang', 'Cabisilan', 'Calungboyan', 'Casiber', 'Dammay', 'Labut', 'Manueva', 'Poblacion', 'Rancho', 'Tabucol'] },
          { name: 'Santa Cruz', barangays: ['Amarao', 'Babayoan', 'Bessang', 'Calaoaan', 'Dalaoen', 'GATBO', 'Poblacion 1 to 4', 'San Antonio', 'San Jose', 'TAMPULAY'] },
          { name: 'Santa Lucia', barangays: ['Aluling', 'Angkio', 'Ayusan', 'Bao-as', 'Baracbac', 'Bulala-Sapa', 'Calipayan', 'Concepcion', 'LILIPUTEN', 'Poblacion', 'San Pedro'] },
          { name: 'Santa Maria', barangays: ['Ag-agrao', 'Ampuagan', 'Baliw', 'Cabaniangan', 'Danuman', 'GATTANG', 'Lesseb', 'Poblacion', 'San Alejandro', 'San Isidro', 'Tina'] },
          { name: 'Santo Domingo', barangays: ['Binalayangan', 'Cabezaria', 'Calay-ab', 'Laing', 'Poblacion 1 to 4', 'Puaping', 'San Pablo', 'Sto. Tomas', 'Vacunero'] },
          { name: 'Tagudin', barangays: ['Ambalayat', 'Baracbac', 'Bio', 'Cabaroan', 'Del Pilar', 'Farola', 'Junction', 'Libtong', 'Pudoc', 'Sawat', 'TALLAOEN'] },
        ],
      },
      {
        name: 'La Union',
        municipalities: [
          { name: 'San Fernando City', barangays: ['Bariis', 'Biday', 'Carlatan', 'Catbangen', 'Dalumpinas', 'Lingsat', 'Madayegdeg', 'Nagsiping', 'Pagdalagan Sur', 'Poblacion I', 'Poblacion II', 'Sevilla', 'Tanqui', 'Urbiztondo'] },
          { name: 'Agoo', barangays: ['Ambitacay', 'Balawarte', 'Capas', 'Consolacion', 'Macalva', 'Nazareno', 'Poblacion', 'San Nicolas East', 'San Nicolas West', 'Santa Barbara', 'Tubao'] },
          { name: 'Aringay', barangays: ['Alaska', 'Basca', 'Dulao', 'Gallano', 'Macabato', 'Pangaoaoan', 'Poblacion 1 to 4', 'Samara', 'San Eugenio', 'Santo Rosario'] },
          { name: 'Bacnotan', barangays: ['Bacqui', 'Bitalag', 'Cabisilan', 'Guinabang', 'Mabato', 'Nagsimana', 'Nagsaag', 'Poblacion', 'Salincob', 'San Francisco', 'Santa Cruz', 'Urbiztondo'] },
          { name: 'Balaoan', barangays: ['Almeida', 'Antonino', 'Bulbulala', 'Cabaroan', 'Calliat', 'Nalasin', 'Poblacion', 'San Anton', 'San Juan', 'Tallipugo'] },
          { name: 'Bangar', barangays: ['Agdeppa', 'Alzate', 'Bangsian', 'Central East', 'Central West', 'Gen. Prim East', 'Gen. Prim West', 'Gen. Terrero', 'Mindoro', 'PAGARAPAR', 'Pudoc', 'Risa'] },
          { name: 'Bauang', barangays: ['Bagbag', 'Baccuit Norte', 'Baccuit Sur', 'Boy-itan', 'Caba', 'Central East', 'Central West', 'Disso-or', 'Paringao', 'Payocpoc Norte', 'Payocpoc Sur', 'Urbiztondo'] },
          { name: 'Caba', barangays: ['BAMBAN', 'Bautista', 'GANA', 'Juan Cartas', 'Las-ud', 'Poblacion Norte', 'Poblacion Sur', 'San Jose', 'Santiago', 'Sobredillo'] },
          { name: 'Luna', barangays: ['Alcala', 'Aypa', 'Barrientos', 'Bungro', 'Buselbusel', 'Magallanes', 'Olea', 'Poblacion', 'Rimos 1 to 5', 'Salaguing', 'TALLAOEN'] },
          { name: 'Naguilian', barangays: ['Aguio', 'Ambaracao Norte', 'Ambaracao Sur', 'BAGTIAN', 'Baraoas', 'Casilagan', 'Mamat-ing Norte', 'Mamat-ing Sur', 'Ortiz', 'Poblacion', 'SILI', 'Surcoc'] },
          { name: 'Rosario', barangays: ['Alipang', 'Ambitacay', 'Amlang', 'Bangar', 'Casilagan', 'Damortis', 'Inabaan Norte', 'Inabaan Sur', 'NAGUILIAN', 'Poblacion East', 'Poblacion West', 'Subusub', 'Udiao'] },
          { name: 'San Juan', barangays: ['Allangigan', 'Ili Sur', 'Ili Norte', 'Nagsaag', 'Taboc', 'Talogtog', 'Urbiztondo'] },
          { name: 'Santo Tomas', barangays: ['Ambitacay', 'Bail', 'Casantaan', 'Damortis', 'LOMBOY', 'Naguilian', 'Patac', 'Poblacion', 'San Jose', 'TULAO'] },
          { name: 'Tubao', barangays: ['Amalitea', 'Andoc', 'Francia Sur', 'Francia West', 'Halog East', 'Halog West', 'Lloren', 'Poblacion', 'Rizal', 'Santa Teresa'] },
        ],
      },
      {
        name: 'Pangasinan',
        municipalities: [
          { name: 'Dagupan City', barangays: ['Bacayao Sur', 'Bacayao Norte', 'Bolosan', 'Bonuan Boquig', 'Bonuan Binloc', 'Bonuan Gueset', 'Caranglaan', 'Herrero-Perez', 'Lucao', 'Malued', 'Mangin', 'Maygatasan', 'Pantal', 'Poblacion Oeste', 'Salapingao', 'Tapuac'] },
          { name: 'San Carlos City', barangays: ['Abanon', 'Agbanban', 'Anando', 'Ano', 'Bacnar', 'Balite Sur', 'Baldog', 'Bolingit', 'Caoayan Kiling', 'Ilang', 'Mamarlao', 'Pangalangan', 'Poblacion', 'Salinap', 'Taloy'] },
          { name: 'Urdaneta City', barangays: ['Anonas', 'Bactad East', 'Bactad West', 'Bayaoas', 'Catablan', 'Consolacion', 'Domanpot', 'Nancamaliran East', 'Nancamaliran West', 'Nancayasan', 'Poblacion', 'San Jose', 'Santa Lucia'] },
          { name: 'Alaminos City', barangays: ['Amandiego', 'Amangbangnan', 'Baleyadaan', 'Bani', 'Bolaney', 'Bued', 'Cabatuan', 'Cayucay', 'Lucap', 'Magsaysay', 'Mono', 'Poblacion', 'Palamis', 'Telbang', 'Victoria'] },
          { name: 'Asingan', barangays: ['Ariston East', 'Ariston West', 'Bantog', 'Baro', 'Bolo', 'Cabancalan', 'Calepaan', 'Carosucan Norte', 'Carosucan Sur', 'Macalong', 'Poblacion West', 'Poblacion East', 'San Rafael', 'Toboy'] },
          { name: 'Bayambang', barangays: ['Alinggan', 'Amanperez', 'Amukao', 'Anambongan', 'Bacus', 'Bical Sur', 'Cadre Site', 'Carungay', 'Caturay', 'Inirangan', 'Macabito', 'Malioer', 'Nalsian', 'Poblacion', 'Sancagulis', 'TAMPOG', 'Tatacbao', 'Wawa'] },
          { name: 'Binalonan', barangays: ['Balangobong', 'Bued', 'Camangaan', 'Canarvacanan', 'Capas', 'Cili', 'Laoac', 'Moreno', 'Poblacion', 'San Felipe', 'Santa Maria', 'Santo Niño', 'Sumabnit'] },
          { name: 'Binmaley', barangays: ['Amburayan', 'Basing', 'Baybay Lopez', 'Caloocan Dupay', 'Camberting', 'Dulag', 'Gayaman', 'Linoc', 'Naguilayan', 'Pangapisan North', 'Pangapisan South', 'Poblacion', 'Salapingao', 'San Isidro', 'Sabangan'] },
          { name: 'Bolinao', barangays: ['Arnedo', 'Balingasay', 'Binabalian', 'Culurbit', 'Dewey', 'Germinal (Poblacion)', 'Guis-guis', 'Luciente 1st', 'Luciente 2nd', 'Patar', 'Pilar', 'Samang Norte', 'San Alfonso', 'Tara', 'TOWING'] },
          { name: 'Calasiao', barangays: ['Ambonao', 'Ambuetel', 'Banaoang', 'Bued', 'Cabuyao', 'Doyong', 'Gabon', 'Lasip', 'Macabito', 'Malabago', 'Nalsian', 'Poblacion', 'San Miguel', 'Songkoy'] },
          { name: 'Lingayen', barangays: ['Aliwekwek', 'Baay', 'Balococ', 'Bantayan', 'Basing', 'Capuroaan', 'Domalandan Center', 'Domalandan East', 'Domalandan West', 'Estanza', 'Lasip', 'Libsong East', 'Libsong West', 'Maniboc', 'Poblacion', 'Tonton'] },
          { name: 'Malasiqui', barangays: ['Agrupacion', 'Aliaga', 'Anolid', 'Apaleng', 'Asin', 'Bacarbao', 'Bawer', 'Bolaoit', 'Cansinala', 'Lunas', 'Poblacion', 'Tambac'] },
          { name: 'Manaoag', barangays: ['Babasit', 'Baguio', 'Baoang', 'Baritao', 'Bisal', 'Cabanbanan', 'Calaocan', 'Inamotan', 'Licsi', 'Lipit Sur', 'Poblacion', 'Sapid'] },
          { name: 'Mangaldan', barangays: ['Anolid', 'Banaoang', 'Bantayan', 'Bari', 'Gueguesangen', 'Inlango', 'Macayug', 'Navatat', 'Poblacion', 'Salay', 'Tebag', 'Tocok'] },
          { name: 'Mangatarem', barangays: ['Andrus', 'Bogtong', 'BUNLALACAN', 'Cabaruan', 'Calumboyan 1st', 'Caturay', 'Gatongan', 'Lawak Langka', 'Poblacion 1 to 4', 'Salavante', 'Sapdaan', 'Zamora'] },
          { name: 'Rosales', barangays: ['Acop', 'Bakit-Bakit', 'Balungao', 'Cabilaoan', 'Calanutan', 'Camangaan', 'Casasan', 'Coliling', 'Don E. Cojuangco', 'Palakipak', 'Poblacion', 'Station District', 'Tomana East'] },
          { name: 'San Fabian', barangays: ['Aramal', 'Binday', 'Bolasi', 'Cabilocaan', 'Cayanga', 'Lipit-Tomeeng', 'Mabilao', 'NIBALIW', 'Poblacion', 'Rizal', 'Tocok'] },
          { name: 'Tayug', barangays: ['Agno', 'Amistad', 'Barangobong', 'Cayamungan', 'Evangelista', 'Libertad', 'Luzon', 'Magallanes', 'Poblacion A', 'Poblacion B', 'Saleng', 'Santo Domingo', 'Trenchera'] },
          { name: 'Villasis', barangays: ['Amamperez', 'Bacag', 'Barangobong', 'Capulaan', 'Caramutan', 'La Paz', 'Poblacion Zone I to IV', 'Puelay', 'San Blas', 'Tombod', 'Unzad'] },
        ],
      },
    ],
  },

  // ─── 4. Region II ───────────────────────────────────────────────────────────
  {
    region: 'Region II - Cagayan Valley',
    provinces: [
      {
        name: 'Cagayan',
        municipalities: [
          { name: 'Tuguegarao City', barangays: ['Annafunan East', 'Annafunan West', 'Atulayan Norte', 'Atulayan Sur', 'Bagay', 'Buntun', 'Caggay', 'Capatagan', 'Carig Norte', 'Carig Sur', 'Cataggaman Pardo', 'Cataggaman Nuevo', 'Centro 1', 'Centro 2', 'Centro 10', 'Linao Norte', 'Ugac Sur', 'Ugac Norte'] },
          { name: 'Abulug', barangays: ['Bagu', 'Bawa', 'Calog Sur', 'Canayun', 'Centro (Poblacion)', 'Lucban', 'Pinili', 'San Julian', 'Santo Tomas', 'Sidu'] },
          { name: 'Alcala', barangays: ['Afusing Bato', 'Afusing Daga', 'Bayan', 'BBO', 'Centro', 'Damurog', 'Jurisdiction', 'Pared', 'Poblacion'] },
          { name: 'Allacapan', barangays: ['Bessang', 'Bubo', 'Capagaran', 'Centro East', 'Centro West', 'Catarawan', 'Dalayap', 'Labben', 'Mapurao', 'Pacac', 'Silagan'] },
          { name: 'Amulung', barangays: ['Abacat', 'Bacring', 'Bayan', 'BCOL', 'Calabbagan', 'Centro', 'Cordova', 'Dadda', 'Estefania', 'Gorospe', 'Monte Alegre', 'NHA'] },
          { name: 'Aparri', barangays: ['Aparri', 'Backiling', 'Bangag', 'Bisagu', 'Bulala', 'Centro 1 to 15', 'Dodan', 'Gaddani', 'Lining', 'Maura', 'Minanga', 'Paddaya', 'Plaza', 'Punta', 'San Antonio'] },
          { name: 'Baggao', barangays: ['Ada', 'Albing', 'Annabisi', 'Asinga-Via', 'Awitan', 'Baculod', 'Bitag Grande', 'Dalupang', 'Hacienda Intal', 'Ibulo', 'Imurung', 'Mabini', 'Poblacion', 'San Jose', 'Tallang'] },
          { name: 'Ballesteros', barangays: ['Amamungan', 'Barbaran', 'Cabaritan East', 'Cabaritan West', 'Cabayu', 'Cabubuhangan', 'Centro East', 'Centro West', 'Fugu', 'Mabuttal East', 'Mabuttal West', 'Poblacion', 'Zitanga'] },
          { name: 'Buguey', barangays: ['Antipolo', 'Ballang', 'Cabunsuran', 'Calitan', 'Centro', 'LAllo', 'Minanyog', 'Poblacion', 'Quinawegan', 'Santa Maria', 'TABBAC'] },
          { name: 'Claveria', barangays: ['Alwarez', 'Bacsay Norte', 'Bacsay Sur', 'Buccao', 'Centro I', 'Centro II', 'CULING', 'DIBAY', 'KILKILING', 'LOMBOY', 'Mablang', 'Pagsanahan Norte', 'Poblacion', 'Taggat Norte'] },
          { name: 'Enrile', barangays: ['Alingapan', 'Batu', 'Centro I to IV', 'Inga', 'Lemu Norte', 'Lemu Sur', 'Roma Norte', 'Roma Sur', 'San Antonio'] },
          { name: 'Gattaran', barangays: ['Abra', 'Barangay 1', 'Barangay 2', 'Bolos Point', 'Capissayan', 'Centro', 'Cumu', 'Dummun', 'Gandu', 'Lapogan', 'Mabanguc', 'Nabangaan', 'Piat', 'Tanglagan'] },
          { name: 'Gonzaga', barangays: ['Amunitan', 'Batangan', 'Baua', 'Cabirischian', 'Caroan', 'Centro', 'Ipil', 'Magrafil', 'Paradise', 'Smart', 'Tapel'] },
          { name: 'Lal-lo', barangays: ['Abagao', 'Alaguia', 'Bagumbayan', 'Banquero', 'Bikiting', 'Cabaggan', 'Cagoran', 'Centro', 'Fabrica', 'Lal-lo', 'Logac', 'San Lorenzo'] },
          { name: 'Piat', barangays: ['Apayao', 'Baung', 'Calapangan Norte', 'Calapangan Sur', 'Centro I & II', 'Maguilling', 'Santa Barbara', 'Villa Maria'] },
          { name: 'Sanchez-Mira', barangays: ['Bagzan', 'Bangan', 'Callungan', 'Centro I & II', 'Dagupan', 'Marzan', 'Masikit', 'Namuac', 'San Rocco', 'Santiago'] },
          { name: 'Santa Ana', barangays: ['Casambalangan', 'Centro', 'KILKILING', 'Marede', 'Palawig', 'Rapuli', 'San Vicente', 'Santa Clara', 'Tangatan'] },
          { name: 'Solana', barangays: ['Andarayan North', 'Andarayan South', 'Bantay', 'Bassi', 'Batu', 'Bebot', 'Calilauan', 'Centro Northeast', 'Centro Northwest', 'Centro Southeast', 'Centro Southwest', 'Dassun', 'Lanna', 'Nangalisan', 'Nattappian', 'Paddle', 'Ubi'] },
        ],
      },
      {
        name: 'Isabela',
        municipalities: [
          { name: 'Ilagan City', barangays: ['Alibago', 'Alinguigan 1st', 'Baligatan', 'Bliss', 'Calamagui 1st', 'Calamagui 2nd', 'Camalaguin', 'Centro Poblacion', 'Divisoria', 'Gayong-gayong Norte', 'Imelda', 'Malannit', 'Marasat Grande', 'Sindon Bayabo', 'Santa Victoria', 'Upi'] },
          { name: 'Cauayan City', barangays: ['Alicaocao', 'Bantug', 'Bua', 'Cabassaran', 'Cabatuan', 'Calamagui East', 'Calamagui West', 'Cassap Fuera', 'District 1 (Poblacion)', 'District 2', 'District 3', 'Labinab', 'Magassi', 'Minante 1', 'Minante 2', 'Nungnungan 1st', 'San Fermin', 'Tagaran'] },
          { name: 'Santiago City', barangays: ['Ambalatungan', 'Balintocatoc', 'Batal', 'Calaoacan', 'Centro East', 'Centro West', 'Dubinan East', 'Dubinan West', 'Four Roads', 'Mabini', 'Malvar', 'Plaridel', 'Rizal', 'Rosario', 'San Andres', 'Victory Norte', 'Victory Sur'] },
          { name: 'Alicia', barangays: ['Ambagabag', 'Antatet', 'Arurow', 'Bangar', 'Burgos', 'Calaoacan', 'Centro 1', 'Centro 2', 'Magsaysay', 'Paddad', 'Rizal', 'San Antonio', 'Santa Cruz', 'Santa Maria', 'Santo Tomas'] },
          { name: 'Cabagan', barangays: ['Anao', 'Baggamak', 'Cansan', 'Casibarag Norte', 'Casibarag Sur', 'Centro 1 to 4', 'Cubag', 'Luquilu', 'Nangalisan', 'San Antonio', 'Santa Bernardita'] },
          { name: 'Cordon', barangays: ['Capirpirwan', 'Caquilingan', 'Duruarog', 'Gayong-gayong', 'La Paz', 'Magsaysay', 'Poblacion', 'Quezon', 'Rizal', 'Talictic', 'Villafuerte'] },
          { name: 'Echague', barangays: ['Angoluan', 'Arabiat', 'Annafunan', 'Bangar', 'Cabugao', 'Canoy', 'Capuseran', 'Centro 1', 'Centro 2', 'Dammang East', 'Fugoso', 'Garay', 'Malambag', 'Poblacion', 'San Fabian', 'San Terenzo'] },
          { name: 'Roxas', barangays: ['Anao', 'Bantug', 'Carmencita', 'Centro Alpha', 'Centro Beta', 'Doña Concha', 'Lanting', 'Maranoc', 'Munoz', 'San Jose', 'San Rafael', 'Vira'] },
          { name: 'San Mateo', barangays: ['Bacarrang', 'Ballesteros', 'Barangay 1 to 4', 'Dagupan', 'Marasin', 'Old San Mateo', 'Poblacion', 'San Andres', 'San Manuel', 'Sinamar Norte'] },
          { name: 'Tumauini', barangays: ['Annafunan', 'Antagan 1st', 'Antagan 2nd', 'Arcon', 'Balug', 'Calaoacan', 'Camasi', 'Lanna', 'Moldero', 'Poblacion 1 to 4', 'San Pedro', 'Santa Visitacion', 'Sinippil'] },
        ],
      },
      {
        name: 'Nueva Vizcaya',
        municipalities: [
          { name: 'Bayombong', barangays: ['Amirhe', 'Bangan', 'Bascaran', 'Bonfal East', 'Bonfal Proper', 'Bonfal West', 'Buag', 'Cabuaan', 'Casat', 'Ipil-Ipil', 'Luyang', 'Magapuy', 'Magsaysay', 'Poblacion', 'Salingsing', 'San Nicolas'] },
          { name: 'Aritao', barangays: ['Banganan', 'Bhabha', 'Bone North', 'Bone South', 'Canabuan', 'Comon', 'Cutar', 'Nagabgaban', 'Poblacion', 'San Antonio', 'San Jose', 'Tabueng', 'Tucao'] },
          { name: 'Bagabag', barangays: ['Bakir', 'Baretbet', 'Careb', 'Lantap', 'Murong', 'Poblacion', 'San Geronimo', 'San Pedro', 'Santa Cruz', 'Tuao'] },
          { name: 'Bambang', barangays: ['Abian', 'Abinganan', 'Aliaga', 'Almaguer North', 'Almaguer South', 'Barangay 1 to 4 (Pob.)', 'Balaobao', 'Darat', 'Indiana', 'Mabuco', 'Manangbag', 'Mauan', 'San Fernando', 'San Antonio North'] },
          { name: 'Diadi', barangays: ['Ampangue', 'Arwas', 'Balete', 'Bugnay', 'Decabacan', 'LURAD', 'Poblacion', 'San Jose', 'Villa Quirino'] },
          { name: 'Dupax del Norte', barangays: ['Binnuangan', 'Ineangan', 'Lamo', 'New Clarin', 'OBBOL', 'Poblacion', 'Ysmael'] },
          { name: 'Solano', barangays: ['Abbag', 'Aggub', 'Bagahabag', 'Bangaan', 'Bangar', 'Bintawan Sur', 'Communal', 'Curifang', 'Dadap', 'Llactac', 'Poblacion North', 'Poblacion South', 'Rizal', 'San Juan', 'San Luis', 'Tucal'] },
        ],
      },
      {
        name: 'Quirino',
        municipalities: [
          { name: 'Cabarroguis', barangays: ['Banuar', 'Burgos', 'Calaoacan', 'Dibibi', 'Dingasan', 'Eden', 'Gomez', 'Gundaway (Poblacion)', 'Mangandingay', 'San Marcos', 'Tucod', 'Villa Pena'] },
          { name: 'Aglipay', barangays: ['Cabaroan', 'Dagupan', 'Dibulung', 'Ligaya', 'Poblacion', 'Progreso', 'Ramos', 'San Leonardo', 'Villa Sur'] },
          { name: 'Diffun', barangays: ['Aglipay', 'Andres Bonifacio', 'Aurora', 'Baguio', 'Campamento', 'Diego Silang', 'Don Mariano Marcos', 'Dumatata', 'Gabriela Silang', 'Gulac', 'Lusod', 'Maria Clara', 'Poblacion', 'Rizal', 'San Antonio', 'San Esteban'] },
          { name: 'Maddela', barangays: ['Abbag', 'Balligui', 'Cabuarayan', 'Calaoacan', 'Dumabato Sur', 'Dumabato Norte', 'Dipintin', 'Divisoria Sur', 'Laur', 'Poblacion Norte', 'Poblacion Sur', 'San Pedro', 'Santa Maria', 'Villa Pag-asa'] },
          { name: 'Nagtipunan', barangays: ['Anak', 'Dipantan', 'La Concepcion', 'Landingan', 'Matmad', 'Poblacion', 'Ponggo', 'San Dionisio', 'Sangbay'] },
          { name: 'Saguday', barangays: ['Cabarroguis', 'Dibul', 'La Paz', 'Magsaysay', 'Poblacion', 'Rizal', 'Salva Cruz'] },
        ],
      },
      {
        name: 'Batanes',
        municipalities: [
          { name: 'Basco', barangays: ['Chanarian', 'Ihubok II (Nuestra Señora del Rosario)', 'Ihubok I (San Antonio)', 'Kayvaluganan', 'Kaychanarianan', 'San Jose (Poblacion)'] },
          { name: 'Itbayat', barangays: ['Raele', 'San Rafael (Idiama)', 'Santa Lucia (Kauwayan)', 'Santa Maria (Marapuy)', 'Santa Rosa (Kaynatupan)'] },
          { name: 'Ivana', barangays: ['Radiwan', 'Salagao', 'San Vicente (Poblacion)', 'Santa Rosa'] },
          { name: 'Mahatao', barangays: ['Haned', 'Kaumburan', 'Umnap', 'Panaytayan'] },
          { name: 'Sabtang', barangays: ['Chavayan', 'Malakdang (Poblacion)', 'Nakanmuan', 'Savidug', 'Sinaspan', 'St. Thomas'] },
          { name: 'Uyugan', barangays: ['Imnajbu', 'Itbud', 'Kayuganan (Poblacion)', 'White Beach'] },
        ],
      },
    ],
  },

  // ─── 5. Region III ──────────────────────────────────────────────────────────
  {
    region: 'Region III - Central Luzon',
    provinces: [
      {
        name: 'Pampanga',
        municipalities: [
          { name: 'San Fernando City', barangays: ['Bulaon', 'Calulut', 'Del Carmen', 'Del Rosario', 'Dolores', 'Juliana', 'Lara', 'Lumban', 'Magliman', 'Maimpis', 'Malpitic', 'Pandaras', 'Panipuan', 'San Agustin', 'San Felipe', 'San Isidro', 'San Jose', 'San Nicolas', 'San Pedro', 'Santa Lucia', 'Santo Rosario (Poblacion)', 'Sindalan', 'Telabastagan'] },
          { name: 'Angeles City', barangays: ['Anunas', 'Balibago', 'Capaya', 'Claro M. Recto', 'Cutcut', 'Cutud', 'Lourdes Sur', 'Lourdes Sur East', 'Lourdes Northwest', 'Malabanias', 'Margot', 'Mining', 'Pampang', 'Pandan', 'Pulung Cacutud', 'Pulung Maragul', 'Pulungbulalu', 'Salapungan', 'San Jose', 'San Nicolas', 'Santa Teresita', 'Santo Cristo', 'Santo Rosario', 'Sto. Domingo', 'Tabun'] },
          { name: 'Mabalacat City', barangays: ['Atlu-Bola', 'Bical', 'Bundagul', 'Camachiles', 'Dau', 'Dolores', 'Duquit', 'Lakandula', 'Mabiga', 'Macapagal Village', 'Mamatit', 'Manggahan', 'Marabul', 'Poblacion', 'San Francisco', 'San Joaquin', 'Santa Ines', 'Santa Maria', 'Santo Rosario', 'Tabun'] },
          { name: 'Apalit', barangays: ['Balucuc', 'Calantipe', 'Capanpangan', 'Paligui', 'San Juan (Poblacion)', 'San Vicente', 'Santa Cruz', 'Tabuyuc (San Antonio)'] },
          { name: 'Arayat', barangays: ['Baliti', 'Batasan', 'Buensuceso', 'Candaba', 'Gatbuca', 'La Paz (Poblacion)', 'Plazang Luma', 'San Agustin Norte', 'San Jose Mesulo', 'San Mateo', 'San Nicolas', 'Santa Lucia'] },
          { name: 'Bacolor', barangays: ['Balas', 'Cabalantian', 'Cabambangan (Poblacion)', 'Cabetican', 'Calibutbut', 'Concepcion', 'Dolores', 'Magliman', 'Mesalipit', 'Parulog', 'Potrero', 'San Antonio', 'Santa Ines'] },
          { name: 'Candaba', barangays: ['Bambang', 'Barangca', 'Buas', 'Cuayang Bugtong', 'Dulong Ilog', 'Gulap', 'Lanang', 'Mandasig', 'Pambuan', 'Pasig', 'Poblacion', 'Salapungan', 'San Agustin', 'Tagulod', 'Tenejero'] },
          { name: 'Floridablanca', barangays: ['Anon', 'Apalit', 'Basa Air Base', 'Benedicto', 'Bodega', 'Cabangcalan', 'Calaguiman', 'Consuelo', 'Gutad', 'Mabical', 'Poblacion', 'San Antonio', 'San Jose', 'San Nicolas', 'San Pedro', 'Santa Monica', 'Solib'] },
          { name: 'Guagua', barangays: ['Ascomo', 'Bancal', 'Jose Abad Santos (Siran)', 'Lambac', 'Magsaysay', 'Maquiapo', 'Natividad', 'Plaza Burgos (Poblacion)', 'Pulungmasle', 'San Antonio', 'San Agustin', 'San Inocencio', 'San Jose', 'San Juan', 'San Nicolas 1st', 'San Pedro', 'San Rafael', 'San Roque', 'Santa Ines', 'Santa Ursula', 'Santo Niño'] },
          { name: 'Lubao', barangays: ['Balanoy', 'Baruya', 'Calangain', 'Concepcion', 'Lourdes', 'Pradoluto', 'Remedios', 'San Antonio', 'San Francisco', 'San Jose Gumi', 'San Juan', 'San Martin', 'San Nicolas 1st', 'San Nicolas 2nd', 'San Pedro Palcarangan', 'San Roque Arbol', 'San Vicente', 'Santa Cruz', 'Santa Lucia (Poblacion)', 'Santo Domingo'] },
          { name: 'Mexico', barangays: ['Arayat', 'Balas', 'Buenavista', 'Camtang', 'Capanpangan', 'Divisoria', 'Lagundi', 'Lapac', 'Masagsag', 'Mexico Poblacion', 'Panipuan', 'Sabanilla', 'San Antonio', 'San Carlos', 'San Jose Matulid', 'San Juan', 'San Miguel', 'San Nicolas', 'San Patricio', 'San Rafael', 'San Roque', 'Santa Cruz', 'Santo Rosario', 'Suclaban'] },
          { name: 'Porac', barangays: ['Babo Pangulo', 'Babo Sacan', 'Balubad', 'Calzadang Bayu', 'Cangatba', 'Diat', 'Hacienda Dolores', 'Manibaug Libutad', 'Manibaug Paralaya', 'Manibaug Pasig', 'Manual', 'Mitla Proper', 'Poblacion', 'Pio', 'Planasi', 'Pulung Santol', 'Salu', 'San Jose Mitla', 'Santa Cruz'] },
        ],
      },
      {
        name: 'Bulacan',
        municipalities: [
          { name: 'Malolos City', barangays: ['Anat', 'Babatnin', 'Bagna', 'Bagong Bayan', 'Balite', 'Balay', 'Barihan', 'Bulihan', 'Bungahan', 'Caingin', 'Canalate', 'Caritas', 'Catmon', 'Cofradia', 'Dakila', 'Guinhawa', 'Liggas', 'Longos', 'Lugam', 'Look 1st', 'Look 2nd', 'Mabolo', 'Mambog', 'Masile', 'Matimbo', 'Mojon', 'Panasahan', 'Pinagbakahan', 'San Agustin', 'San Gabriel', 'San Juan', 'San Pablo', 'San Vicente (Poblacion)', 'Santa Isabel', 'Santo Rosario', 'Sumapang Bata', 'Sumapang Matanda', 'Taal', 'Tikay'] },
          { name: 'Meycauayan City', barangays: ['Bagbaguin', 'Bahay Pare', 'Bancal', 'Banga', 'Bayugo', 'Calvario', 'Camalig', 'Hulo', 'Iba', 'Lawa', 'Libtong', 'Liputan', 'Malhacan', 'Perez', 'Poblacion', 'Saluysoy', 'St. Francis', 'Tugatog', 'Urbano', 'Zamora'] },
          { name: 'San Jose del Monte City', barangays: ['Assumption', 'Bagong Buhay I', 'Bagong Buhay II', 'Dulong Bayan', 'Fatima I', 'Fatima II', 'Gumaoc East', 'Gumaoc West', 'Graceville', 'Kaybanban', 'Kaypian', 'Maharlika', 'Muzon', 'Paradise III', 'Poblacion', 'Poblacion I', 'San Martin I', 'San Pedro', 'Santa Cruz I', 'Santo Cristo', 'Tungkong Mangga'] },
          { name: 'Baliwag City', barangays: ['Bagong Nayon', 'Barit', 'Calantipay', 'Catulinan', 'Concepcion', 'Hinukay', 'Makinabang', 'Matangtubig', 'Pagala', 'Paitan', 'Piel', 'Poblacion', 'Rizal', 'Sabang', 'San Jose', 'San Roque', 'Santa Barbara', 'Santo Niño', 'Subic', 'Sulivan', 'Tangos', 'Tarcan', 'Tiaong', 'Tibag', 'Tilapayong'] },
          { name: 'Bocaue', barangays: ['Antipolo', 'Bagumbayan', 'Bambang', 'Batas', 'Biñang 1st', 'Biñang 2nd', 'Bolacan', 'Bundukan', 'Bunlo', 'Caingin', 'Dulong Bayan', 'Igulot', 'Lolomboy', 'Poblacion', 'Sulucan', 'Taal', 'Turo', 'Wakas'] },
          { name: 'Bulakan', barangays: ['Bagumbayan', 'Balubad', 'Bambang', 'Matungao', 'Perez', 'Pitpitan', 'Poblacion', 'San Francisco', 'San Jose', 'San Nicolas', 'Santa Ana', 'Santa Ines', 'Taliptip', 'Tibig'] },
          { name: 'Calumpit', barangays: ['Balungao', 'Bayanihan', 'Bulusan', 'Calizon', 'Calungusan', 'Caniogan', 'Corazon', 'Frances', 'Gatbuca', 'Gugu', 'Iba Este', 'Iba O\'Este', 'Longos', 'Meysulao', 'Meyto', 'Palimbang', 'Panducot', 'Poblacion', 'Pungo', 'San Jose', 'San Marcos', 'San Miguel', 'Santa Lucia', 'Santo Niño', 'Sapang Bayan', 'Suklayin'] },
          { name: 'Guiguinto', barangays: ['Cutcut', 'Daungan', 'Ilang-Ilang', 'Malis', 'Panginay', 'Poblacion', 'Pritil', 'Pulong Gubat', 'Santa Cruz', 'Santa Rita', 'Tabang', 'Tabe', 'Tiaong'] },
          { name: 'Hagonoy', barangays: ['Abulalas', 'Carillo', 'Iba', 'Iba-Ibayo', 'Mercado', 'Palapat', 'Pugad', 'San Agustin', 'San Isidro', 'San Jose', 'San Juan', 'San Miguel', 'San Nicolas', 'San Pedro', 'San Roque', 'San Sebastian', 'Santa Cruz', 'Santa Elena', 'Santa Monica', 'Santo Niño', 'Santo Rosario', 'Tampok', 'Tibaguin'] },
          { name: 'Marilao', barangays: ['Abangan Norte', 'Abangan Sur', 'Ibayo', 'Lias', 'Loma de Gato', 'Nagbalon', 'Patubig', 'Poblacion I', 'Poblacion II', 'Prenza I', 'Prenza II', 'Santa Rosa I', 'Santa Rosa II', 'Tabing Ilog'] },
          { name: 'Plaridel', barangays: ['Agnaya', 'Bagong Silang', 'Banga 1st', 'Banga 2nd', 'Bintog', 'Bulihan', 'Culianin', 'Dampol', 'Lagundi', 'Lalangan', 'Lumang Bayan', 'Panginay', 'Poblacion', 'Rueda', 'San Jose', 'Santa Ines', 'Santo Niño', 'Sipat', 'Tabang'] },
          { name: 'Pulilan', barangays: ['Balatong A', 'Balatong B', 'Cutcog', 'Dampol 1st', 'Dampol 2nd A', 'Dampol 2nd B', 'Dulong Malabon', 'Inaon', 'Longos', 'Lumbac', 'Paltao', 'Peñabatan', 'Poblacion', 'San Francisco', 'Santa Peregrina', 'Santo Cristo', 'Taal', 'Tabang', 'Tinejero'] },
          { name: 'San Miguel', barangays: ['Bagong Pag-asa', 'Balaong', 'Balite', 'Bantog', 'Bardias', 'Baral', 'Bayanihan', 'Camias', 'King Kabayo', 'Labne', 'Magmarale', 'Maligaya', 'Mandile', 'Partida', 'Poblacion', 'Pulong Bayabas', 'Salacot', 'Salangan', 'San Agustin', 'San Jose', 'San Juan', 'San Vicente', 'Santa Ines', 'Santa Lucia', 'Santa Rita', 'Santo Niño', 'Sibul'] },
          { name: 'Santa Maria', barangays: ['Bagbaguin', 'Balasing', 'Buenavista', 'Bulac', 'Camangyanan', 'Catmon', 'Cay Pombo', 'Caysio', 'Guyong', 'Lalakhan', 'Mag-asawang Sapa', 'Mahabang Parang', 'Manggahan', 'Parada', 'Poblacion', 'Pulong Buhangin', 'San Gabriel', 'San Jose Patag', 'San Martin', 'Santa Clara', 'Santa Cruz', 'Silangan', 'Tabing Bakod', 'Tumana'] },
        ],
      },
      {
        name: 'Nueva Ecija',
        municipalities: [
          { name: 'Cabanatuan City', barangays: ['Aduas Centro', 'Aduas Norte', 'Aduas Sur', 'Bagong Sikat', 'Bantug Bulalo', 'Bantug Norte', 'Barlis', 'Barrera', 'Bitas', 'Cabu', 'Calawag', 'Campo Tinio', 'Cinense', 'Cushman', 'Dicarma', 'Imelda', 'Kalikid Norte', 'Kalikid Sur', 'Kapasigan', 'Magsaysay District', 'Mayapyap Norte', 'Mayapyap Sur', 'Pangatian', 'Poblacion Norte', 'Poblacion Sur', 'San Josef Norte', 'San Josef Sur', 'Sangitan East', 'Sangitan West', 'Santa Arcadia', 'Sumacab Este', 'Sumacab Norte', 'Sumacab South', 'Valdefuerza', 'Vijay'] },
          { name: 'Gapan City', barangays: ['Balante', 'Bayanihan', 'Bulak', 'Bungo', 'Caingin', 'Kapalangan', 'Mambangnan', 'Pambuan', 'Parcutela', 'Poblacion Norte', 'Poblacion Sur', 'San Cruz', 'San Lorenzo', 'San Nicolas', 'San Vicente', 'Santo Cristo Norte', 'Santo Cristo Sur'] },
          { name: 'Palayan City', barangays: ['Atate', 'Cabitos', 'Caimito', 'Ganaderia', 'Imelda Valley', 'Langla', 'Malate', 'Manacnac', 'Popolon', 'Singalat'] },
          { name: 'San Jose City', barangays: ['Abar 1st', 'Abar 2nd', 'Caanawan', 'Calaocan', 'Camanacsacan', 'Culiyang', 'Karatiew', 'Kita-Kita', 'Malasin', 'Manicla', 'Palestina', 'Pinili', 'Poblacion East', 'Poblacion West', 'Resort', 'San Agustin', 'Sto. Tomas', 'Tayabo', 'Tondod'] },
          { name: 'Science City of Muñoz', barangays: ['Bagong Sikat', 'Balante', 'Bantug', 'Bical', 'Cabituculan East', 'Cabituculan West', 'Calabalabaan', 'Catalanacan', 'Curva', 'Franza', 'Labney', 'Licaong', 'Linglingay', 'Mangandingay', 'Mapangpang', 'Poblacion East', 'Poblacion North', 'Poblacion South', 'Poblacion West', 'Rang-ayan', 'Rizal', 'San Antonio', 'San Felipe', 'Villa Cuizon', 'Villa Isla'] },
          { name: 'Aliaga', barangays: ['Bucot', 'La Purisima', 'Magsaysay', 'Macabucod', 'Poblacion Centro', 'Poblacion East 1', 'Poblacion West 1', 'San Emiliano', 'San Juan', 'San Pablo Bata', 'San Pablo Matanda', 'Santa Cruz', 'Santo Rosario', 'Sunson'] },
          { name: 'Cabiao', barangays: ['Bagong Sikat', 'Bagong Silang', 'Concepcion', 'Entablado', 'Palasinan', 'Poblacion', 'San Antonio', 'San Fernando Norte', 'San Fernando Sur', 'San Gregorio', 'San Juan North', 'San Juan South', 'San Roque', 'San Vicente', 'Santa Ines', 'Santa Isabel', 'Sinipit'] },
          { name: 'Guimba', barangays: ['Aguitap', 'Ayos Lomboy', 'Bacayao', 'Bagong Barrio', 'Bantug', 'Bunol', 'Cabalardosan', 'Cabaruan', 'Causwagan', 'Cavite', 'CULING', 'Galvan', 'Guiset', 'Lamorito', 'Lennec', 'Macampping', 'Nagsingao', 'Pacac', 'Poblacion', 'San Agustin', 'San Bernardino', 'San Roque', 'Santa Cruz', 'Santo Cristo', 'Subol', 'Tampac I', 'Tampac II', 'Triala'] },
          { name: 'Jaen', barangays: ['Calaba', 'Dampulan', 'Don Mariano Marcos', 'Hilera', 'Lambakin', 'Langla', 'Mabini', 'Napo', 'Niyugan', 'Pamacpacan', 'Pinagpanaan', 'Poblacion', 'San Jose', 'San Josef Nabao', 'San Pablo', 'San Roque', 'Santa Barbara', 'Santo Tomas South', 'Ulanin Pitak'] },
          { name: 'San Antonio', barangays: ['Buliran', 'Cama Juan', 'Julo', 'Lawang Cupang', 'Luyos', 'Magsaysay', 'Papaya', 'Poblacion', 'San Francisco', 'San Jose', 'San Mariano', 'Santa Barbara', 'Santa Cruz', 'Santo Cristo', 'Tikiw'] },
          { name: 'San Isidro', barangays: ['Alua', 'Calaba', 'Malapit', 'Mangga', 'Poblacion', 'Pambuan', 'San Roque', 'Santo Cristo'] },
          { name: 'Talavera', barangays: ['Baculis', 'Bakal I', 'Bakal II', 'Balele', 'Bambang', 'Bantug', 'Bulac', 'Burnay', 'Calipahan', 'Capihan', 'Casocsohan', 'Collado', 'Dimasalang Norte', 'KDR', 'La Torre', 'Lomboy', 'Mabuhay', 'Maqdalena', 'Minabuyok', 'Pag-asa', 'Poblacion Sur', 'Poblacion Norte', 'Pula', 'Pulong Buli', 'San Ricardo', 'Sampaloc', 'Sibul', 'Tabacing', 'Taguro'] },
        ],
      },
      {
        name: 'Tarlac',
        municipalities: [
          { name: 'Tarlac City', barangays: ['Aguso', 'Alvindia', 'Amucao', 'Armenia', 'Asturias', 'Atlu-Bola', 'Baras-baras', 'Batang-batang', 'Bora', 'Balingcanaway', 'Calingcuan', 'Care', 'Central', 'Culipat', 'Dolores', 'Ligtasan', 'Maliwalo', 'Mapaci', 'Matatalaib', 'Paraiso', 'Poblacion', 'Salapungan', 'San Carlos', 'San Francisco', 'San Isidro', 'San Jose', 'San Manuel', 'San Nicolas', 'San Rafael', 'San Vicente', 'Santa Maria', 'Santo Cristo', 'Santo Domingo', 'Santo Niño', 'Suizo', 'Tibag', 'Ungot'] },
          { name: 'Camiling', barangays: ['Anac', 'Bacabac', 'Bacsay', 'Bancay 1st', 'Bilad', 'Birbira', 'Cacamilingan Norte', 'Cacamilingan Sur', 'Caniogan', 'CIBUS', 'Cayaoan', 'Guelguel', 'Malacampa', 'Parez', 'Poblacion A to J', 'San Esteban', 'San Isidro', 'San Jose', 'Santa Maria', 'Telbang'] },
          { name: 'Capas', barangays: ['Aranguren', 'Bueno', 'Cutcut 1st', 'Cutcut 2nd', 'Dolores', 'Estrada', 'Lawy', 'Mango', 'Manlapig', 'Maruglu', 'O\'Donnell', 'Poblacion', 'San Carlos', 'San Jose', 'Santa Juliana', 'Santa Lucia', 'Santa Rita', 'Santo Domingo 1st', 'Santo Rosario'] },
          { name: 'Concepcion', barangays: ['Alfonso', 'Balutu', 'Caluluan', 'Castillo', 'Coronel', 'Dutu', 'Lutu', 'Macabacle', 'Magao', 'Minane', 'Panlio', 'Poblacion', 'San Agustin', 'San Antonio', 'San Bartolome', 'San Francisco', 'San Isidro', 'San Jose', 'San Juan', 'San Martin', 'San Nicolas 1st', 'San Nicolas 2nd', 'San Pedro', 'Santa Cruz', 'Santa Maria', 'Santa Rosa', 'Santo Niño', 'Telabastagan'] },
          { name: 'Gerona', barangays: ['Abagon', 'Apsayan', 'Ayson', 'Bangar', 'Bawa', 'Calocagan', 'Carbonel', 'Cardona', 'Caturay', 'Dunsol', 'Mabini', 'Matayumtayum', 'Pargas', 'Poblacion 1 to 3', 'Quezon', 'Salapungan', 'San Antonio', 'San Jose', 'Santa Lucia', 'Singat', 'Tangcaran', 'Vargas'] },
          { name: 'Paniqui', barangays: ['Acupang', 'Agur', 'Balaoang', 'Barangay 1 to 4 (Pob.)', 'Cariño', 'Cayanga', 'Colibangbang', 'Coral', 'Dapdap', 'Eduardo', 'Mabilao', 'Manaois', 'Nancamarinan', 'Palicao', 'Pamelpingan', 'Salumague', 'Samput', 'San Carlos', 'San Isidro', 'San Juan de Mata', 'Santa Ines', 'Tablang'] },
        ],
      },
      {
        name: 'Zambales',
        municipalities: [
          { name: 'Olongapo City', barangays: ['Asinan', 'Banicain', 'Barretto', 'East Bajac-Bajac', 'East Tapinac', 'Gordon Heights', 'Kalaklan', 'Mabayuan', 'New Cabalan', 'Old Cabalan', 'Pag-asa', 'Santa Rita', 'West Bajac-Bajac', 'West Tapinac'] },
          { name: 'Iba', barangays: ['Amungan', 'Bangantalingting', 'Dirita-Balitoc', 'Lipay-Dingin-Panibuatan', 'Palanginan', 'Poblacion 1 to 14', 'San Agustin', 'Santa Barbara', 'Zone 1 to 6'] },
          { name: 'Subic', barangays: ['Aplaya', 'Asinan', 'Baraca-Camachile', 'Batac', 'Cawag', 'Ilwas', 'Mangan-Vaca', 'Matain', 'Naugsol', 'Pamatawan', 'Poblacion', 'San Isidro', 'Santo Tomas', 'Wawandue'] },
          { name: 'Castillejos', barangays: ['Balaybay', 'Buenavista', 'Del Pilar', 'Magsaysay', 'Nagbayan', 'Nagbunga', 'San Agustin', 'San Jose', 'San Juan', 'San Nicolas', 'Santa Maria'] },
          { name: 'San Marcelino', barangays: ['Aglao', 'Buhawen', 'Central', 'Consuelo Norte', 'Consuelo Sur', 'La Paz', 'Laoag', 'Linao', 'Lucsuhin', 'Nagtapulao', 'Pagsabungan', 'Rizal', 'San Guillermo', 'San Isidro', 'San Rafael', 'Santa Fe'] },
        ],
      },
      {
        name: 'Bataan',
        municipalities: [
          { name: 'Balanga City', barangays: ['Bagumbayan', 'Cabog-Cabog', 'Camacho', 'Cataning', 'Central', 'Cupang North', 'Cupang Proper', 'Cupang West', 'Dangcol', 'Doña Francisca', 'Ibayo', 'Itwason', 'Lote', 'Malabia', 'Munting Batangas', 'Poblacion', 'Puerto Rivas Ibaba', 'Puerto Rivas Itaas', 'Puerto Rivas Lote', 'San Jose', 'Sibacan', 'Talisay', 'Tenejero', 'Tuyo'] },
          { name: 'Dinalupihan', barangays: ['Aquino', 'Bangal', 'Bayan-Bayanan', 'Bonifacio', 'Burgos', 'Colo', 'Daang Bago', 'Dlayap', 'Happy Valley', 'Jose C. Payumo, Jr.', 'Luacan', 'Mabini Extension', 'Maligaya', 'Magsaysay', 'Naparo', 'Padre Dandan', 'Pag-asa', 'Paguiruan', 'Payangan', 'Pentor', 'Pita', 'Rizal', 'Roosevelt', 'San Benito', 'San Isidro', 'San Ramon', 'Santa Isabel', 'Santo Niño', 'Tubo-Tubo', 'Tucop'] },
          { name: 'Mariveles', barangays: ['Alion', 'Alas-as', 'Balon-Anito', 'Baseco Country', 'Biaan', 'Cabcaben', 'Camaya', 'Ipag', 'Lucanin', 'Malaya', 'Maligaya', 'Mt. View', 'Poblacion', 'San Carlos', 'San Isidro', 'Sisiman', 'Townsite'] },
          { name: 'Orani', barangays: ['Apollo', 'Bagong Paraiso', 'Balut', 'Bayan', 'Calero', 'Dona', 'Kaparangan', 'Masantol', 'Mulawin', 'Paking', 'Pantinople', 'Poblacion', 'San Jose', 'Silahis', 'Tala', 'Tala-Tala', 'Tubo-Tubo', 'Wawa'] },
        ],
      },
      {
        name: 'Aurora',
        municipalities: [
          { name: 'Baler', barangays: ['Barangay 1 to 5 (Pob.)', 'Buhangin', 'Calabuanan', 'Obligacion', 'Pingit', 'Reserva', 'Sabang', 'Suklayin'] },
          { name: 'Dingalan', barangays: ['Aplaya', 'Caragsacan', 'Dikapanikian', 'Ibona', 'Poblacion', 'Paltic', 'Tanawan', 'Umiray'] },
          { name: 'Maria Aurora', barangays: ['Alcala', 'Bagra', 'Bayanihan', 'Bazal', 'Cabatuan', 'Cadican', 'Diaat', 'Dialatnan', 'Diteki', 'Poblacion', 'San Joaquin', 'Villa Aurora'] },
        ],
      },
    ],
  },

  // ─── 6. Region IV-A ─────────────────────────────────────────────────────────
  {
    region: 'Region IV-A - CALABARZON',
    provinces: [
      {
        name: 'Rizal',
        municipalities: [
          { name: 'Antipolo City', barangays: ['Bagong Nayon', 'Beverly Hills', 'Dela Paz', 'Inarawan', 'Mambugan', 'Mayamot', 'Muntingdilaw', 'San Isidro', 'San Jose', 'San Juan', 'San Luis', 'San Roque', 'Santa Cruz'] },
          { name: 'Cainta', barangays: ['San Andres', 'San Juan', 'San Roque', 'Santa Rosa', 'Santo Domingo', 'Santo Niño'] },
          { name: 'Taytay', barangays: ['Dolores (Poblacion)', 'Muzon', 'San Juan', 'San Isidro', 'Santa Ana'] },
          { name: 'Binangonan', barangays: ['Bangad', 'Calumpang', 'Ithan', 'Janosa', 'Kalawaan', 'Kaysabang', 'Libis', 'Lunsad', 'Mahabang Parang', 'Mambog', 'Pag-asa', 'Pantok', 'Pila-Pila', 'Poblacion', 'Rayap', 'San Carlos', 'Tatala'] },
          { name: 'San Mateo', barangays: ['Ampid I', 'Ampid II', 'Banaba', 'Dulong Bayan 1', 'Dulong Bayan 2', 'Guitnang Bayan 1', 'Guitnang Bayan 2', 'Maly', 'Pintong Bukawe', 'San Jose', 'San Rafael', 'Silangan'] },
          { name: 'Rodriguez / Montalban', barangays: ['Balite', 'Burgos', 'Geronimo', 'Macabud', 'Manggahan', 'Mascap', 'Puray', 'Rosario', 'San Jose', 'San Isidro', 'San Rafael'] },
        ],
      },
      {
        name: 'Laguna',
        municipalities: [
          { name: 'Calamba City', barangays: ['Bagong Kalsada', 'Bañadero', 'Banlic', 'Barandal', 'Batino', 'Bubuyan', 'Bucal', 'Bunggo', 'Burol', 'Camaligan', 'Canlubang', 'Halang', 'Lawa', 'Lecheria', 'Lingga', 'Looc', 'Makiling', 'Mapagong', 'Mayapa', 'Palingon', 'Parian', 'Poblacion 1 to 7', 'Real', 'Saimsim', 'Sampiruhan', 'Sirang Lupa', 'Turbina', 'Uwisan'] },
          { name: 'Santa Rosa City', barangays: ['Aplaya', 'Balibago', 'Caingin', 'Dila', 'Dita', 'Don Jose', 'Ibaba', 'Kanluran', 'Labas', 'Macabling', 'Malitlit', 'Malusak', 'Market Area', 'Pooc', 'Sinalhan', 'Tagapo'] },
          { name: 'Biñan City', barangays: ['Bungahan', 'Canlalay', 'Casilahan', 'De La Paz', 'Ganado', 'Langkiwa', 'Loma', 'Malaban', 'Malamig', 'Mamburan', 'Platero', 'Poblacion', 'San Antonio', 'San Francisco', 'San Jose', 'San Vicente', 'Santo Niño', 'Santo Tomas', 'Soro-Soro', 'Tubigan', 'Zapote'] },
          { name: 'Cabuyao City', barangays: ['Baclaran', 'Banay-Banay', 'Banlic', 'Bigaa', 'Butong', 'Casile', 'Diezmo', 'Gulod', 'Mamatid', 'Marinig', 'Niugan', 'PITTland', 'Poblacion I to III', 'Sala', 'San Isidro'] },
          { name: 'San Pedro City', barangays: ['Bagong Silang', 'Calendola', 'Chrysanthemum', 'Cuyab', 'Estrella', 'Fátima', 'G.S.I.S.', 'Landayan', 'Langgam', 'Laram', 'Magsaysay', 'Maharlika', 'Pacita I', 'Pacita II', 'Poblacion', 'Riverside', 'Rosario', 'Sampaguita Village', 'San Antonio', 'San Roque', 'San Vicente', 'United Bayanihan', 'United Better Living'] },
          { name: 'San Pablo City', barangays: ['Bagong Bayan', 'Barangay I-A to VII-E', 'Bautista', 'Concepcion', 'Del Remedio', 'Dolores', 'San Buenaventura', 'San Crispin', 'San Cristobal', 'San Francisco', 'San Gabriel', 'San Gregorio', 'San Ignacio', 'San Jose', 'San Juan', 'San Lucas 1st', 'San Lucas 2nd', 'San Marcos', 'San Mateo', 'San Miguel', 'San Nicolas', 'San Pedro', 'San Rafael', 'San Roque', 'San Vicente', 'Santa Ana', 'Santa Catalina', 'Santa Cruz', 'Santa Maria', 'Santa Monica', 'Santiago', 'Soledad'] },
          { name: 'Los Baños', barangays: ['Anos', 'Bagong Silang', 'Bambang', 'Batong Malake', 'Baybayin', 'Bayog', 'Lalakay', 'Maahas', 'Malinta', 'Mayndon', 'Putho-Tuntungin', 'San Antonio', 'Tadlac', 'Timugan'] },
          { name: 'Santa Cruz', barangays: ['Alipit', 'Bagumbayan', 'Bubukal', 'Calios', 'Gatid', 'Javan', 'Labuin', 'Malinao', 'Oogong', 'Pagsawitan', 'Palasan', 'Poblacion I to V', 'San Jose', 'San Juan', 'Santisima Cruz', 'Santo Angel Central', 'Santo Angel Norte', 'Santo Angel Sur'] },
        ],
      },
      {
        name: 'Cavite',
        municipalities: [
          { name: 'Bacoor City', barangays: ['Alima', 'Aniban I to V', 'Bayanan', 'Campo Santo', 'Daang Hari', 'Dulong Bayan', 'Habay I & II', 'Kaingen', 'Ligas I to III', 'Mambog I to V', 'Molino I to VII', 'Niog I to III', 'Panapaan I to VIII', 'Poblacion', 'Queens Row East', 'Queens Row West', 'Queens Row Central', 'Real I & II', 'Salawag', 'Talaba I to VII', 'Zapote I to V'] },
          { name: 'Imus City', barangays: ['Alapan I-A to II-B', 'Anabu I-A to II-F', 'Bayan Luma I to IX', 'Bucandala I to V', 'Carsadang Bago I & II', 'Malagasang I-A to II-G', 'Medicion I-A to II-F', 'Pag-Asa I to III', 'Poblacion I-A to IV-D', 'Tanzang Luma I to VI', 'Toclong I-A to II-B'] },
          { name: 'Dasmariñas City', barangays: ['Burol I to III', 'Dasmariñas Bagong Bayan (Zone 1 to 12)', 'Langkaan I & II', 'Paliparan I to III', 'Salawag', 'Salitran I to IV', 'Sampaloc I to V', 'San Agustin I to III', 'San Antonio De Padua', 'Victoria Reyes'] },
          { name: 'General Trias City', barangays: ['Arnaldo', 'Bacao I & II', 'Bagumbayan', 'Bambang', 'Biclatan', 'Buenavista I to III', 'Corregidor', 'Dulong Bayan', 'Gov. Ferrer', 'Javalera', 'Manggahan', 'Navarro', 'Pasong Kawayan I & II', 'Pasong Camachile I & II', 'Poblacion', 'San Francisco', 'San Gabriel', 'San Juan I & II', 'Santa Clara', 'Santiago', 'Tejero'] },
          { name: 'Tagaytay City', barangays: ['Asisan', 'Bagong Tubig', 'Calabuso', 'Dumuclas', 'Iruhin East', 'Iruhin West', 'Iruhin South', 'Kaybagal East', 'Kaybagal North', 'Kaybagal South', 'Mendez Crossing East', 'Mendez Crossing West', 'Neogan', 'Patutong Malaki North', 'Patutong Malaki South', 'Sambong', 'San Jose', 'Silang Junction North', 'Silang Junction South', 'Sungay North', 'Sungay South', 'Tolentino East', 'Tolentino West'] },
          { name: 'Trece Martires City', barangays: ['Aguado', 'Cabezas', 'Cabuco', 'Concepcion', 'De Ocampo', 'Inocencio', 'Lallana', 'Lapidario', 'Lucucian', 'Osorio', 'Perez', 'San Agustin', 'San Luciano'] },
          { name: 'Silang', barangays: ['Acacia', 'Adlas', 'Anahaw I & II', 'Balite I & II', 'Biga I & II', 'Biluso', 'Buctao', 'Bulihan', 'Cabangaan', 'Carmen', 'Hoyohoy', 'Kaong', 'Lalaan 1st & 2nd', 'Litlit', 'Lucsuhin', 'Lumil', 'Maguyam', 'Munting Ilog', 'Poblacion I to V', 'Pooc I & II', 'Pulong Bunga', 'Sabutan', 'Tartaria', 'Tibig', 'Tubuan I to III'] },
          { name: 'Tanza', barangays: ['Amaya I to VII', 'Bagtas', 'Bucal', 'Buntog', 'Calibuyo', 'Capipisa', 'Daang Amaya I & II', 'Halayhay', 'Julugan I to VIII', 'Mulawin', 'Paradahan I & II', 'Poblacion I to IV', 'Sahud Ulan', 'Sanja Mayor', 'Santol', 'Tanauan', 'Tres Cruses'] },
        ],
      },
      {
        name: 'Batangas',
        municipalities: [
          { name: 'Lipa City', barangays: ['Adya', 'Anilao', 'Antipolo del Norte', 'Antipolo del Sur', 'Balintawak', 'Banaybanay', 'Bolbok', 'Bugtong na Pulo', 'Bulacnin', 'Calamias', 'Cuta', 'Dagatan', 'Halang', 'Inosloban', 'Kayumanggi', 'Latag', 'Lumbang', 'Mataas na Lupa', 'Marawoy', 'Pangao', 'Pinagtongulan', 'Poblacion Barangay 1 to 12', 'Rizal', 'Sabang', 'San Carlos', 'San Jose', 'San Salvador', 'Santo Toribio', 'Tambo', 'Tangarag', 'Tibig'] },
          { name: 'Batangas City', barangays: ['Alangilan', 'Balagtas', 'Balete', 'Banaba Center', 'Banaba Ibaba', 'Banaba Silangan', 'Bolbok', 'Calicanto', 'Catapan', 'Cuta', 'Dumantay', 'Gulod Labac', 'Gulod Itaas', 'Kumintang Ibaba', 'Kumintang Ilaya', 'Libjo', 'Mabacong', 'Paharang West', 'Pallocan West', 'Pallocan East', 'Poblacion 1 to 24', 'San Agapito', 'San Isidro', 'Santa Rita Karsada', 'Tinga Itaas', 'Tinga Labac', 'Tulo'] },
          { name: 'Tanauan City', barangays: ['Bagbag', 'Bagumbayan', 'Balele', 'Banjo West', 'Banjo East', 'Bilog-Bilog', 'Boot', 'Cale', 'Darasa', 'Gonzales', 'Hidalgo', 'Janopol Occidental', 'Janopol Oriental', 'Luyos', 'Mabini', 'Natatas', 'Pagaspas', 'Poblacion Barangay 1 to 7', 'Sala', 'Sambat', 'San Jose', 'Santor', 'Suplang', 'Tinurik', 'Trapiche', 'Ulango', 'Wawa'] },
          { name: 'Sto. Tomas City', barangays: ['San Bartolome', 'San Felix', 'San Fernando', 'San Francisco', 'San Jose', 'San Juan', 'San Luis', 'San Marcos', 'San Miguel', 'San Pedro', 'San Rafael', 'San Roque', 'San Vicente', 'Santa Anastasia', 'Santa Clara', 'Santa Cruz', 'Santa Elena', 'Santa Maria', 'Santiago', 'Poblacion I to IV'] },
          { name: 'Nasugbu', barangays: ['Bilaran', 'Bucana', 'Catandaan', 'Cogunan', 'Dayap', 'Kaylaway', 'Looc', 'Lumbangan', 'Malawin', 'Matabungkay', 'Natipuan', 'Papaya', 'Poblacion Barangay 1 to 12', 'Utod', 'Wawa'] },
        ],
      },
      {
        name: 'Quezon',
        municipalities: [
          { name: 'Lucena City', barangays: ['Barangay 1 to 11 (Pob.)', 'Bocohan', 'Cotta', 'Dalahican', 'Domoit', 'Gulang-Gulang', 'Ibabang Dupay', 'Ibabang Iyam', 'Ibabang Talim', 'Ilayang Dupay', 'Ilayang Iyam', 'Isabang', 'Kanlurang Mayao', 'Market View', 'Mayao Castillo', 'Mayao Crossing', 'Mayao Kanluran', 'Mayao Silangan', 'Ransohan', 'Silangang Mayao', 'Talao-Talao'] },
          { name: 'Tayabas City', barangays: ['Alitao', 'Alsam Ibaba', 'Alsam Ilaya', 'Angustias', 'Anuling', 'Baguio', 'Banilad', 'Camiposa', 'Dapdap', 'Ibabang Bukal', 'Ibabang Palale', 'Ilayang Bukal', 'Ilayang Palale', 'Ipilan', 'Katigan', 'Lalo', 'Mate', 'Poblacion 1 to 6', 'Rizal', 'San Isidro', 'Tamlong'] },
          { name: 'Candelaria', barangays: ['Bukal Sur', 'Buenavista East', 'Buenavista West', 'Kinatihan I', 'Kinatihan II', 'Malabanban Norte', 'Malabanban Sur', 'Masin Norte', 'Masin Sur', 'Mayabobo', 'Pahinga Norte', 'Pahinga Sur', 'Poblacion', 'San Andres', 'San Isidro', 'Santa Catalina Norte', 'Santa Catalina Sur'] },
          { name: 'Sariaya', barangays: ['Antipolo', 'Balubal', 'Bignay 1st', 'Castañas', 'Concepcion Banahaw', 'Concepcion 1st', 'Guisguis San Antonio', 'Janagdong 1st', 'Lutucan 1st', 'Manggalang 1st', 'Poblacion I to VI', 'Sampaloc 1st', 'San Isidro', 'Tumbaga 1st'] },
        ],
      },
    ],
  },

  // ─── 7. Region IV-B ─────────────────────────────────────────────────────────
  {
    region: 'Region IV-B - MIMAROPA',
    provinces: [
      {
        name: 'Oriental Mindoro',
        municipalities: [
          { name: 'Calapan City', barangays: ['Balingayan', 'Balite', 'Baruyan', 'Batino', 'Bayanihan', 'Biga', 'Calero', 'Camansihan', 'Camilmil', 'Canubing I', 'Canubing II', 'Comunal', 'Guinobatan', 'Ibaba West', 'Ibaba East', 'Ilaya', 'Lalud', 'Lazareto', 'Libis', 'Lumangbayan', 'Mahal Na Pangalan', 'Maidlang', 'Pachoca', 'Palanhi', 'Poblacion', 'Salong', 'San Antonio', 'Santa Isabel', 'Santo Niño', 'Suqui', 'Tawiran', 'Tibag', 'Wawa'] },
          { name: 'Naujan', barangays: ['Adrialene', 'Andres Ylagan', 'Antipolo', 'Aplaya', 'Argin', 'Baguidambacan', 'Balite', 'Bancuro', 'Barcenaga', 'Bayani', 'Buhangin', 'Caburo', 'Comunal', 'Estrella', 'Inarawan', 'Kabilang Pinagsabangan', 'Lumangbayan', 'Malaya', 'Malinao', 'Melgar A', 'Melgar B', 'Montelelao', 'Montemayor', 'Nag-Iba 1st', 'Poblacion', 'Santa Maria', 'Santo Niño', 'Tagumpay'] },
          { name: 'Pinamalayan', barangays: ['Anoling', 'Bacungan', 'Bangbang', 'Banilad', 'Cacawan', 'Del Razon', 'Guinhawa', 'Inclusion', 'Lumambayan', 'Malaya', 'Maliangcog', 'Maningcol', 'Marfrancisco', 'Nabuslot', 'Pagi', 'Papandayan', 'Pili', 'Poblacion 1 to 4', 'Quinabigan', 'Ranzo', 'Rosario', 'Sabang', 'Santa Isabel', 'Santa Maria', 'Santo Niño', 'Wawa'] },
          { name: 'Puerto Galera', barangays: ['Aninuan', 'Baclayan', 'Balatero', 'Dulangan', 'Palangan', 'Poblacion', 'Puerto Galera', 'Sabang', 'San Antonio', 'San Isidro', 'Santo Niño', 'Sinandigan', 'Tabinay', 'Villaflor'] },
        ],
      },
      {
        name: 'Palawan',
        municipalities: [
          { name: 'Puerto Princesa City', barangays: ['Babuyan', 'Bacungan', 'Bagong Sikat', 'Bahile', 'Bancao-Bancao', 'Binduyan', 'Buncag', 'Cabayugan', 'Concepcion', 'Irawan', 'Iwahig', 'Kamuning', 'Langogan', 'Liwanag', 'Luzviminda', 'Macarascas', 'Mangingisda', 'Manalo', 'Milagrosa', 'Napsan', 'Palawan Village', 'Poblacion', 'San Jose', 'San Manuel', 'San Miguel', 'San Pedro', 'Santa Cruz', 'Santa Lourdes', 'Tagburos', 'Tanabag'] },
          { name: 'El Nido', barangays: ['Bagong Buhay', 'Bebeladan', 'Corong-Corong', 'Mabini', 'Manlag', 'Pasadeña', 'Poblacion (Buena Suerte)', 'San Fernando', 'Sibaltan', 'Teneguiban', 'Villa Libertad', 'Villa Paz'] },
          { name: 'Coron', barangays: ['Banuang Daan', 'Bintuan', 'Borac', 'Buenavista', 'Cabugao', 'Decabobo', 'Laluag', 'Malawig', 'Marcilla', 'Poblacion 1 to 6', 'San Jose', 'San Nicolas', 'Tagumpay'] },
          { name: 'Brooke\'s Point', barangays: ['Amoras', 'Aribungos', 'Baras', 'Barong-barong', 'Calasaguen', 'Imulnod', 'Ipilan', 'Mainit', 'Malis', 'Mambalot', 'Oco', 'Pangabilian', 'Poblacion I to II', 'Salogon', 'Samariniana', 'Tubtub'] },
          { name: 'Narra', barangays: ['Antipuluan', 'Aramaywan', 'Batang-batang', 'Bato-bato', 'Burirao', 'Caguisan', 'Calateggas', 'El Vita', 'Estrella Village', 'Malatgao', 'Malinao', 'Panacan', 'Poblacion', 'Princess Urduja', 'San Isidro', 'Santa Cruz', 'Teresa'] },
        ],
      },
      {
        name: 'Occidental Mindoro',
        municipalities: [
          { name: 'Mamburao', barangays: ['Balansay', 'Barangay 1 to 9 (Pob.)', 'Fatima', 'Payompon', 'San Luis', 'Talabaan', 'Tangkob', 'Tayamaan'] },
          { name: 'Sablayan', barangays: ['Arellano', 'Batong Buhay', 'Buenavista', 'Burgos', 'Claro M. Recto', 'Ilvita', 'Libaong', 'Ligaya', 'Poblacion (Buenavista)', 'San Agustin', 'San Francisco', 'San Nicolas', 'Santa Lucia', 'Santo Niño', 'Tagumpay', 'Tuban', 'Victoria'] },
          { name: 'San Jose', barangays: ['Amami', 'Ansiray', 'Bagong Sikat', 'Bangkal', 'Batasan', 'Bayot', 'Central', 'Labangan Ilog', 'Labangan Poblacion', 'Magbay', 'Mapaya I & II', 'Murtha', 'Pag-Asa', 'Poblacion I to VIII', 'San Agustin', 'San Isidro', 'San Roque'] },
        ],
      },
      {
        name: 'Marinduque',
        municipalities: [
          { name: 'Boac', barangays: ['Agot', 'Agumaymayan', 'Amoingon', 'Apitong', 'Bagas', 'Balaring', 'Balimbing', 'Banot', 'Bantad', 'Bintakay', 'Boi', 'Canat', 'Catubugan', 'Cawit', 'Daig', 'Daypay', 'Dulay', 'Ihatub', 'Ino', 'Isuk', 'Landy', 'Lupac', 'Mainit', 'Malbog', 'Malusas', 'Mansiwat', 'Mataas Na Bayan', 'Maybo', 'Mercado', 'Murallon', 'Oja', 'Pawa', 'Poblacion', 'Poras', 'Putiing Buhangin', 'San Antonio', 'Santol', 'Sawi', 'Tabi', 'Tampus', 'Tanza', 'Tugos'] },
        ],
      },
      {
        name: 'Romblon',
        municipalities: [
          { name: 'Romblon', barangays: ['Agnay', 'Agpanabat', 'Agtongo', 'AgVIRAC', 'Alad', 'Barangay I to IV (Pob.)', 'Cajimos', 'Calabogo', 'Capaclan', 'Cogon', 'Lhabac', 'Lunas', 'Mapula', 'Palje', 'Sabangan', 'Sawang', 'Susuican'] },
          { name: 'Odiongan', barangays: ['Amatong', 'Anagao', 'Bangon', 'Batiano', 'Bato', 'Budiong', 'Canduyong', 'Dap-dap', 'Ligaya', 'Liwanag', 'Liwayway', 'Malilico', 'Mayha', 'Pato-o', 'Poctoy', 'Progreso East', 'Progreso West', 'Rizal', 'San Agustin', 'San Antonio', 'San Fernando', 'San Jose', 'Tulay', 'Tuburan'] },
        ],
      },
    ],
  },

  // ─── 8. Region V ────────────────────────────────────────────────────────────
  {
    region: 'Region V - Bicol Region',
    provinces: [
      {
        name: 'Albay',
        municipalities: [
          { name: 'Legazpi City', barangays: ['Bagong Abre', 'Bgy 1 to 70', 'Bigaa', 'Binanuahan', 'Bogtong', 'Bonot', 'Buang', 'Buyuan', 'Cabangan', 'Cruzada', 'Dap-dap', 'Em\'s Barrio', 'Estanza', 'Homapon', 'Imperial Court', 'Kawit', 'Lapu-lapu', 'Lamba', 'Mabini', 'Oro Site', 'Padang', 'Pawa', 'Puro', 'Rawis', 'Sagpon', 'San Joaquin', 'Tawa', 'Tulatulaan'] },
          { name: 'Daraga', barangays: ['Alcala', 'Alobo', 'Anislag', 'Bañag', 'Bascaran', 'Busay', 'Cagbacong', 'Canal', 'Cullat', 'Gapon', 'Inararan', 'Kimantong', 'Lacag', 'Malabog', 'Market Area', 'Matnog', 'Mayon', 'Mi-isi', 'Penafrancia', 'Poblacion', 'Sagpon', 'San Antonio', 'San Jose', 'San Roque', 'Tabon-tabon', 'Tagas'] },
          { name: 'Ligao City', barangays: ['Abella', 'Allang', 'Amantic', 'Anoma', 'Bacong', 'Bagumbayan', 'Balisong', 'Bonga', 'Busay', 'Calabidongan', 'Catburawan', 'Cavasi', 'Cawayan', 'Guilid', 'Herrera', 'Layon', 'Macalidong', 'Mahaba', 'Nasisi', 'Paulba', 'Poblacion', 'Rizal', 'San Francisco', 'Santa Cruz', 'Talavern', 'Tiontson', 'Tuburan'] },
          { name: 'Tabaco City', barangays: ['AEC', 'Bacolod', 'Bangkiling', 'Bantayan', 'Baranghawon', 'Bongabong', 'Borumbo', 'Cabriban', 'Cobob', 'Cormidal', 'Divino Rostro', 'Fatima', 'Guinobat', 'Karuhatan', 'Lamba', 'Malilipot', 'Matagbac', 'Oras', 'Panal', 'Pawa', 'Poblacion', 'Quinale', 'San Antonio', 'San Carlos', 'San Juan', 'San Lorenzo', 'San Roque', 'Santa Cruz', 'Santo Cristo', 'Sua', 'Tagas', 'Tayhi'] },
          { name: 'Guinobatan', barangays: ['Agpay', 'Inamnan Grande', 'Inamnan Pequeño', 'Bagsa', 'Binogsacan Lower', 'Bololo', 'Calzada', 'Catagbacan', 'Inascan', 'Lower Binogsacan', 'Mauraro', 'Muladbucad Grande', 'Poblacion', 'San Francisco', 'San Rafael', 'Tandarora'] },
        ],
      },
      {
        name: 'Camarines Sur',
        municipalities: [
          { name: 'Naga City', barangays: ['Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag', 'Cararayan', 'Carolina', 'Concepcion Pequeña', 'Concepcion Grande', 'Dayangdang', 'Del Rosario', 'Dinaga', 'Equalitad', 'Igualdad', 'Lerma', 'Liboton', 'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang', 'San Francisco', 'San Isidro', 'Santa Cruz', 'Triangulo', 'Tinago'] },
          { name: 'Iriga City', barangays: ['Antipolo', 'Cristo Rey', 'Del Rosario', 'Francia', 'La Anunciacion', 'La Purisima', 'La Trinidad', 'San Agustin', 'San Antonio', 'San Francisco', 'San Isidro', 'San Jose', 'San Juan', 'San Miguel', 'San Nicolas', 'San Pedro', 'San Roque', 'Santa Cruz', 'Santa Isabel', 'Santa Maria', 'Santo Domingo', 'Santo Niño'] },
          { name: 'Pili', barangays: ['Anayan', 'Bagong Sirang', 'Cadlan', 'Caroyroyan', 'Curry', 'Del Rosario', 'Himaao', 'La Asuncion', 'New San Roque', 'Old San Roque', 'Pajarillo', 'Poblacion', 'San Agustin', 'San Antonio', 'San Isidro', 'San Jose', 'San Juan', 'San Vicente', 'Santa Cruz', 'Santiago', 'Tagbong'] },
          { name: 'Calabanga', barangays: ['Balatasan', 'Balongay', 'Belen', 'Bigaain', 'Boto', 'Cagbibi', 'Camaligan', 'Comaguingking', 'Dominorog', 'Harubay', 'La Purisima', 'Lugsad', 'Manguiring', 'Pagatpat', 'Poblacion', 'Punta Tarawal', 'Sabang', 'San Antonio', 'San Francisco', 'San Isidro', 'San Jose', 'San Vicente', 'Santa Cruz', 'Santa Isabel', 'Sibobo', 'Tomagodtoc'] },
        ],
      },
      {
        name: 'Camarines Norte',
        municipalities: [
          { name: 'Daet', barangays: ['Alaawi', 'Awitan', 'Bagasbas', 'Bibirao', 'Borabod', 'Calasgasan', 'Camambugan', 'Cobangbang', 'Dogongan', 'Gahonon', 'Gubat', 'Lag-on', 'Magang', 'Mambalite', 'Manet', 'Mancruz', 'Pamorangon', 'Poblacion 1 to 8', 'San Felipe', 'Santa Cruz'] },
          { name: 'Labo', barangays: ['Anibawan', 'Aura', 'Baay', 'Bagong Silang', 'Bautista', 'Bayan-Bayan', 'Benoit', 'Calabasa', 'Camagong', 'Fundado', 'Guinto', 'Lugui', 'Mabitac', 'Malasugui', 'Malatapay', 'Masalong', 'Olandis', 'PAG-ASA', 'Poblacion 1 & 2', 'San Aetius', 'San Francisco', 'Santa Cruz', 'Talisay', 'Tigbinan'] },
        ],
      },
      {
        name: 'Sorsogon',
        municipalities: [
          { name: 'Sorsogon City', barangays: ['Abuyog', 'Almendras-Cogon', 'Balogo', 'Baribag', 'Bibincahan', 'Bitan-o/Dalipay', 'Bogña', 'Bucalbucalan', 'Cabid-an', 'Cambulaga', 'Capuy', 'Macabari', 'Maninho', 'Pangpang', 'Piot', 'Poblacion', 'Rizal', 'Roro', 'Salog', 'Sirangan', 'Sulucan', 'Talisay'] },
          { name: 'Bulan', barangays: ['Abad Santos', 'Aquino', 'Antipolo', 'Bagasbas', 'BICA', 'Bongon', 'Calomagon', 'Fabrica', 'Inararan', 'J.P. Laurel', 'Libertad', 'Magsaysay', 'N. Roosevelt', 'Otavi', 'Poblacion 1 to 8', 'R. Gerona', 'San Juan', 'San Rafael', 'San Vicente', 'Zone 1 to 8'] },
          { name: 'Donsol', barangays: ['Alin', 'Awang', 'Bandandi', 'Banjawan', 'Barangay 1 to 10 (Pob.)', 'Bayawas', 'Bororan', 'Cabugao', 'Dancalan', 'Gimagaan', 'Mabini', 'Ogod', 'Pangpang', 'San Antonio', 'San Isidro', 'San Vicente', 'Santa Cruz', 'Tuba', 'Vinisitahan'] },
        ],
      },
      {
        name: 'Masbate',
        municipalities: [
          { name: 'Masbate City', barangays: ['Asid', 'Bacca', 'Bañadero', 'Banting', 'Bapor', 'Batuhan', 'Bayombon', 'Bolo', 'Cagay', 'Cawayan', 'Centro', 'Espinosa', 'Ibingay', 'Kalipay', 'Kinasangan', 'Mabolo', 'Malinta', 'Mayngaran', 'Nursery', 'Pawa', 'Poblacion', 'Sinisian', 'Tugbo'] },
          { name: 'Aroroy', barangays: ['Ambolong', 'Amot', 'Amurao', 'Balisong', 'Baluing', 'Bangon', 'Cabangrayan', 'Cabitan', 'Concepcion', 'Dayhagan', 'Don Francisco', 'Jaboyoan', 'Lanang', 'Manamoc', 'Mataba', 'Muroc', 'Panique', 'Poblacion', 'Puerto Bello', 'San Agustin', 'San Jose', 'Tigbao'] },
        ],
      },
      {
        name: 'Catanduanes',
        municipalities: [
          { name: 'Virac', barangays: ['Antipolo', 'Batalay', 'Baties', 'Capihan', 'Cavinitan', 'Concepcion', 'Danicop', 'Francia', 'Gogon', 'Hicming', 'Lictin', 'Maculi', 'Marilima', 'Pagnitoan', 'Palta Big', 'Palta Small', 'Poblacion 1 to 5', 'Rawis', 'San Isidro', 'San Jose', 'San Pablo', 'San Pedro', 'Santa Cruz', 'Santa Elena', 'Santo Domingo', 'Valencia'] },
        ],
      },
    ],
  },

  // ─── 9. Region VI ───────────────────────────────────────────────────────────
  {
    region: 'Region VI - Western Visayas',
    provinces: [
      {
        name: 'Iloilo',
        municipalities: [
          { name: 'Iloilo City', barangays: ['Abeto Mirasol', 'Airport', 'Alalasan', 'Arevalo Proper', 'Bakhaw', 'Balantang', 'Bito-on', 'Bolilao', 'Buenavista', 'Buntatala', 'Calajunan', 'Calaparan', 'City Proper', 'Cuartero', 'Desamparados', 'Dungeg', 'Hibao-an Norte', 'Hibao-an Sur', 'Jaro Proper', 'La Paz Proper', 'Lapuz Norte', 'Mandurriao Proper', 'Molo Proper', 'Obrero', 'Quintin Salas', 'San Jose', 'San Pedro', 'Sooc', 'Tabuc Suba', 'Tazoc', 'Villa Anita'] },
          { name: 'Passi City', barangays: ['Agrupacion', 'Agsinaya', 'Agupis', 'Alegria', 'Ayaman', 'Bayan', 'Bitaogan', 'Buenavista', 'Cabatangan', 'Cadagmayan', 'Gines Viejo', 'Man-it', 'Poblacion Ilawod', 'Poblacion Ilaya', 'Salngan', 'Santo Tomas', 'Tudela'] },
          { name: 'Oton', barangays: ['Abilay', 'Botong', 'Buray', 'Cabatangan', 'Cambitu', 'Camburhat', 'Culaytay', 'Poblacion', 'Pakiad', 'Rizal', 'San Antonio', 'San Nicolas', 'Santa Clara', 'Santa Monica', 'Santa Rita', 'Trapiche'] },
          { name: 'Santa Barbara', barangays: ['Agutayan', 'Bolong Este', 'Bolong Oeste', 'Cabuug', 'Camambugan', 'Duyan-Duyan', 'Ingore', 'Lutac', 'Malawog', 'Poblacion Zone 1 to 6', 'San Sebastian', 'Sangzone', 'Tuguis'] },
          { name: 'Pototan', barangays: ['Abangay', 'Ambo-an', 'Bariw', 'Batuan', 'Bongco', 'Cagangohan', 'Cau-ayan', 'Culob', 'Dapitan', 'Iwa', 'Lay-ahan', 'Lico', 'Lopez Jaena', 'Nanga', 'Poblacion', 'Rumbang', 'San Antonio', 'Tuburan'] },
          { name: 'Janiuay', barangays: ['Abangay', 'Aquino', 'Barasalon', 'Buhiskis', 'Cabantog', 'Calao', 'Caraudan', 'Damires', 'Gines', 'Golondrina', 'Jibolo', 'Matag-ub', 'Monfort', 'Poblacion', 'San Julian', 'Santo Tomas'] },
        ],
      },
      {
        name: 'Negros Occidental',
        municipalities: [
          { name: 'Bacolod City', barangays: ['Alangilan', 'Alijis', 'Banago', 'Barangay 1 to 41 (Pob.)', 'Bata', 'Cabug', 'Estefania', 'Felisa', 'Granada', 'Handumanan', 'Mansilingan', 'Mandalagan', 'Montevista', 'Pahanocoy', 'Punta Taytay', 'Singcang-Airport', 'Sum-ag', 'Tangub', 'Taculing', 'Villamonte', 'Vista Alegre'] },
          { name: 'Bago City', barangays: ['Abuanan', 'Alianza', 'Atipuluan', 'Bacong-Montilla', 'Bagroy', 'Balingasag', 'Binubuhan', 'Busay', 'Calumangan', 'Caridad', 'Dulao', 'Ilijan', 'Lag-Asan', 'Ma-ao', 'Mailum', 'Malingin', 'Napoles', 'Poblacion', 'Sagasa', 'Sampinit', 'Tabunan'] },
          { name: 'Cadiz City', barangays: ['Andres Bonifacio', 'Banquerohan', 'Barangay 1 to 6 (Pob.)', 'Burgos', 'Cabahug', 'Cadiz Viejo', 'Caduha-an', 'Celestino Villacin', 'Ditching', 'Jerusalem', 'Luna', 'Mabini', 'Magsaysay', 'Sicaba', 'Tiglawigan', 'Tinampaan', 'Zone 1 to 6'] },
          { name: 'Kabankalan City', barangays: ['Bantayan', 'Binicuil', 'Camingawan', 'Camansi', 'Carol-an', 'Daan Banwa', 'Inapoy', 'Linao', 'Locotan', 'Magballo', 'Oringao', 'Poblacion', 'Salong', 'San Mateo', 'Tagukon', 'Tampalon', 'Tan-Awan', 'Tapi'] },
          { name: 'Sagay City', barangays: ['Andres Bonifacio', 'Bato', 'Baviera', 'Buluangan', 'Campo Himoga-an', 'Colonia Divina', 'Fabrica', 'General Luna', 'Lopez Jaena', 'Malabon', 'Molocaboc', 'Old Sagay', 'Poblacion', 'Rizal', 'Taba-ao', 'Tadlong', 'Vito'] },
          { name: 'San Carlos City', barangays: ['Bagonbon', 'Balintawak', 'Buluangan', 'Codcod', 'Guadalupe', 'Nataban', 'Palampas', 'Poblacion I & II', 'Prosperidad', 'Punao', 'Quezon', 'Rizal', 'San Juan'] },
          { name: 'Silay City', barangays: ['Bagtic', 'Balaring', 'Barangay 1 to 6 (Pob.)', 'E. Lopez', 'Guimbala-on', 'Hawaiian', 'Kapitan Ramon', 'Lantad', 'Mambulac', 'Rizal', 'Silay City Proper'] },
          { name: 'Talisay City', barangays: ['Bubog', 'Cabatangan', 'Dos Hermanas', 'Efigenio Lizares', 'Matab-ang', 'Poblacion', 'San Fernando', 'Zone 1 to 16'] },
          { name: 'Victorias City', barangays: ['Barangay 1 to 21', 'Estate', 'Gawi', 'Poblacion', 'Star', 'State Center'] },
        ],
      },
      {
        name: 'Capiz',
        municipalities: [
          { name: 'Roxas City', barangays: ['Adlawan', 'Bato', 'Bayan', 'Bayan-Bayan', 'Baybay', 'Bolo', 'Cabugao', 'Cogon', 'Culasi', 'Dayao', 'Dinginan', 'Inzo Arnaldo Village', 'Jumaguicjic', 'Lawaan', 'Lonoy', 'Milibili', 'Mongpong', 'Poblacion I to X', 'Punta Cogon', 'Punta Tabuc', 'San Jose', 'Tanza', 'Tiza'] },
        ],
      },
      {
        name: 'Aklan',
        municipalities: [
          { name: 'Kalibo', barangays: ['Andagao', 'Bachaw Norte', 'Bachaw Sur', 'Briones', 'Buswang New', 'Buswang Old', 'Caano', 'Estancia', 'Linabuan Norte', 'Mobo', 'Nalook', 'Poblacion', 'Pook', 'Tigayon'] },
          { name: 'Malay / Boracay', barangays: ['Argao', 'Balabag (Boracay)', 'Cabapan', 'Caticlan', 'Cubay Norte', 'Cubay Sur', 'Manoc-Manoc (Boracay)', 'Motag', 'Nabaoy', 'Poblacion', 'San Sambag', 'Yapak (Boracay)'] },
        ],
      },
      {
        name: 'Antique',
        municipalities: [
          { name: 'San Jose de Buenavista', barangays: ['Barangay 1 to 8 (Pob.)', 'Bariri', 'Bugarot', 'Funda-Dalipe', 'Inabasan', 'Magcalon', 'Malaiba', 'Maybato Norte', 'Maybato Sur', 'Mojon', 'San Fernando', 'Supa'] },
        ],
      },
      {
        name: 'Guimaras',
        municipalities: [
          { name: 'Jordan', barangays: ['Alaguisoc', 'Balcon Maravilla', 'Balcon Melliza', 'Baluarte', 'Bugnay', 'Buluangan', 'Cabalagnan', 'Espinosa', 'Hoskyn', 'Lawi', 'Poblacion', 'Rizal', 'San Miguel', 'Santa Teresa'] },
        ],
      },
    ],
  },

  // ─── 10. Region VII ─────────────────────────────────────────────────────────
  {
    region: 'Region VII - Central Visayas',
    provinces: [
      {
        name: 'Cebu',
        municipalities: [
          { name: 'Cebu City', barangays: ['Adlaon', 'Apas', 'Bacayan', 'Banilad', 'Basak San Nicolas', 'Basak Pardo', 'Binaliw', 'Bonbon', 'Budlaan', 'Buhisan', 'Bulacao', 'Buot-Taup', 'Busay', 'Calamba', 'Cambinocot', 'Capitol Site', 'Carreta', 'Cogon Ramos', 'Day-as', 'Duljo Fatima', 'Guadalupe', 'Inayawan', 'Kalunasan', 'Kamagayan', 'Kamputhaw', 'Kasambagan', 'Kinasang-an Pardo', 'Labangon', 'Lahug', 'Lorega San Nicolas', 'Mabini', 'Mabolo', 'Malubog', 'Mambaling', 'Pahina San Nicolas', 'Pardo', 'Pari-an', 'Pit-os', 'Poblacion Pardo', 'Pulangbato', 'Pung-ol Sibugay', 'Sambag I', 'Sambag II', 'San Antonio', 'San Jose', 'San Nicolas Proper', 'San Roque', 'Santa Cruz', 'Sawang Calero', 'Sirao', 'Suba', 'Talamban', 'Tisa', 'Toong', 'Zapatera'] },
          { name: 'Mandaue City', barangays: ['Alang-Alang', 'Bakilid', 'Banilad', 'Basak', 'Cabancalan', 'Cambaro', 'Canduman', 'Casili', 'Casuntingan', 'Centro (Looc)', 'Cubacub', 'Guizo', 'Ibabao-Estancia', 'Jagobiao', 'Labogon', 'Looc', 'Maguikay', 'Mantuyong', 'Opao', 'Pagsabungan', 'Subangdaku', 'Tabok', 'Tingub', 'Tipolo', 'Umapad'] },
          { name: 'Lapu-Lapu City', barangays: ['Agus', 'Babag', 'Bankal', 'Baring', 'Basak', 'Buaya', 'Calawisan', 'Canjulao', 'Caw-oy', 'Cawhagan', 'Gun-ob', 'Ibo', 'Looc', 'Mactan', 'Maribago', 'Marigondon', 'Pajac', 'Pajo', 'Poblacion', 'Punta Engaño', 'Sabang', 'Santa Rosa', 'Subabasbas', 'Tingo', 'Tungasan'] },
          { name: 'Talisay City', barangays: ['Biasong', 'Bulacao', 'Camp IV', 'Cansojong', 'Dumlog', 'Jaclupan', 'Lagtang', 'Lawaan I to III', 'Linao', 'Maghaway', 'Manipis', 'Mohon', 'Poblacion', 'Pooc', 'San Isidro', 'San Roque', 'Tabunok', 'Tapul'] },
          { name: 'Toledo City', barangays: ['Awihao', 'Bagakay', 'Bato', 'Biga', 'Bulongan', 'Cabitoonan', 'Calongcalong', 'Cambang-ug', 'Camp 8', 'Canlumampao', 'Cantabaco', 'Captain Claudio', 'Don Andres Soriano (Lutopan)', 'Dumatad', 'Gen. Climaco', 'Ibo', 'Ilihan', 'Landahan', 'Loay', 'Luray I & II', 'Matab-ang', 'Media Onse', 'Pangamihan', 'Poblacion', 'Poog', 'Putilan', 'Sangi', 'Subayon', 'Talavera', 'Tubod'] },
          { name: 'Danao City', barangays: ['Baliang', 'Baybas', 'Bilot', 'Cabungahan', 'Cogon-Cruz', 'Dungga', 'Guinsay', 'Ibo', 'Looc', 'Magas', 'Maslog', 'Nangka', 'Obrero', 'Poblacion', 'Quisol', 'Sabang', 'San Antonio', 'Santa Rosa', 'Taboc', 'Taytay', 'Tuburan Sur'] },
          { name: 'Carcar City', barangays: ['Bolinawan', 'Buenavista', 'Calidngan', 'Can-asujan', 'Guadalupe', 'Liburon', 'Napalan', 'Ocaña', 'Perrelos', 'Poblacion I to III', 'Talisay', 'Tuyan', 'Valladolid'] },
          { name: 'Naga City', barangays: ['Alpaco', 'Bahi', 'Balirong', 'Cabungahan', 'Cantao-an', 'Central Poblacion', 'Cogon', 'Colon', 'Inayagan', 'Inoburan', 'Jaguimit', 'Lanas', 'Langtad', 'Lutac', 'Mainit', 'Mayana', 'Naalad', 'North Poblacion', 'Pangdan', 'Patag', 'South Poblacion', 'Tagjaguimit', 'Tangke', 'Tinaan', 'Tuyan'] },
          { name: 'Bogo City', barangays: ['Ananapor', 'Anapog', 'Balaas', 'Banban', 'Binabag', 'Bungtod', 'Carbon', 'Cayang', 'Combado', 'Dakit', 'Don Pedro', 'Gairan', 'La Paz', 'La Libertad', 'Lourdes', 'Malingin', 'Marangog', 'Nailon', 'Odlot', 'Poblacion', 'Polambato', 'Samba', 'San Vicente', 'Santo Niño', 'Siocon', 'Sudlonon', 'Taytayan'] },
          { name: 'Consolacion', barangays: ['Cabangahan', 'Cansaga', 'Casili', 'Dap-dap', 'Gahit', 'Jugan', 'Lamac', 'Lanipga', 'Nangka', 'Panas', 'Poblacion Occidental', 'Poblacion Oriental', 'Pulpogan', 'Sacsac', 'TAYUD', 'Tugbongan'] },
          { name: 'Liloan', barangays: ['Cabadiangan', 'Calero', 'Catarman', 'Cotcot', 'Jubay', 'Lataban', 'Poblacion', 'San Roque', 'San Vicente', 'Santa Cruz', 'Tabla', 'Tayud', 'Yati'] },
          { name: 'Minglanilla', barangays: ['Cadulawan', 'Calajo-an', 'Camp 7', 'Camp 8', 'Cuanos', 'Guindaruhan', 'Linao', 'Manduang', 'Pakigne', 'Poblacion Ward 1 to 4', 'Tubod', 'Tulay', 'Tungkil', 'Tungkop'] },
          { name: 'Balamban', barangays: ['Abucayan', 'Aliwanay', 'Arpili', 'Baji', 'Biasong', 'Buanoy', 'Cabagdalan', 'Cambuhawe', 'Cansomoroy', 'Gaas', 'Ginatilan', 'Hingatmonan', 'Lamesa', 'Liki', 'Luca', 'Matun-og', 'Nangka', 'Poblacion', 'Pondol', 'Prenza', 'Singsing', 'Sunog', 'Vito'] },
        ],
      },
      {
        name: 'Bohol',
        municipalities: [
          { name: 'Tagbilaran City', barangays: ['Bool', 'Booy', 'Cabawan', 'Cogon', 'Dampas', 'Dao', 'Manga', 'Mansasa', 'Poblacion I to III', 'San Isidro', 'Tiptip', 'Ubujan'] },
          { name: 'Panglao', barangays: ['Bil-isan', 'Bolod', 'Danao', 'Doljo', 'Lawais', 'Libaong', 'Looc', 'Poblacion', 'Tawala'] },
          { name: 'Dauis', barangays: ['Biking', 'Bingag', 'Catarman', 'Dao', 'Mariveles', 'Poblacion', 'San Cruz', 'Songculan', 'Tabalong', 'Tinago'] },
          { name: 'Ubay', barangays: ['Achila', 'Bay-ang', 'Biabas', 'Bongbong', 'Bulilis', 'Cagting', 'Camambugan', 'Casares', 'Fátima', 'Gaviota', 'Humayhumay', 'Ilihan', 'Juagdan', 'LOMBOY', 'Poblacion', 'San Francisco', 'San Isidro', 'San Pascual', 'San Vicente', 'Sentinela', 'Sinandigan', 'Tapal', 'Tubaruran', 'Villa Teresita'] },
          { name: 'Carmen', barangays: ['Alegria', 'Bilar', 'Buenos Aires', 'Camanaga', 'Guanacot', 'Katipunan', 'La Libertad', 'Matene', 'Nueva Vida', 'Poblacion Norte', 'Poblacion Sur', 'Tocboss', 'Villaflor'] },
        ],
      },
      {
        name: 'Negros Oriental',
        municipalities: [
          { name: 'Dumaguete City', barangays: ['Bagacay', 'Bajumpandan', 'Balugo', 'Bantayan', 'Batinguel', 'Buñao', 'Cadawinonan', 'Calindangan', 'Camanjac', 'Candau-ay', 'Cantil-e', 'Daro', 'Junob', 'Looc', 'Mangnao-Calangag', 'Motong', 'Piapi', 'Poblacion 1 to 8', 'Pulantubig', 'Tabuc-tubig', 'Taclobo', 'Talay'] },
          { name: 'Bayawan City', barangays: ['Ali-is', 'Banaybanay', 'Banga', 'Boyco', 'Cabcabon', 'Caroyroyan', 'Dawis', 'Kalamtukan', 'Kalumboyan', 'Malabugas', 'Mandu-aw', 'Maniniyo', 'NHA', 'Novalices', 'Poblacion', 'San Jose', 'Suba', 'Tabuan', 'Tayawan', 'Ubos'] },
          { name: 'Guihulngan City', barangays: ['Bakid', 'Balangbalang', 'Basak', 'Binobohan', 'Buenavista', 'Bulado', 'Calamba', 'Hibaiyo', 'Hilaitan', 'Kagawasan', 'Linantuyan', 'Luz', 'Mabunga', 'Magsaysay', 'Malusay', 'McKinley', 'Napo', 'Poblacion', 'Plaza', 'Tacpao', 'Trinidad', 'Villegas'] },
          { name: 'Bais City', barangays: ['Biñohan', 'Cabanlutan', 'Calasga-an', 'Cambagahan', 'Cambalon', 'Cambuilao', 'Canlambo', 'Capiñahan', 'Consuelo', 'Danapao', 'Hangyad', 'La Paz', 'Lo-oc', 'Lonoy', 'Mabunao', 'Panala-an', 'Poblacion', 'Sab-ang', 'San Pedro', 'Tagbao', 'Tamisu', 'Tangculogan', 'Valencia'] },
        ],
      },
      {
        name: 'Siquijor',
        municipalities: [
          { name: 'Siquijor', barangays: ['Banban', 'Bolos', 'Caipilan', 'Cang-alwang', 'Cang-atuyom', 'Cang-isang', 'Cang-stru', 'Canmangao', 'Catulayan', 'Dulagang', 'Ibulo', 'Lico-an', 'Luyang', 'Poblacion', 'Pangi', 'Polangyuta', 'San Antonio', 'Songculan', 'Talingting', 'TULAPOS'] },
        ],
      },
    ],
  },

  // ─── 11. Region VIII ────────────────────────────────────────────────────────
  {
    region: 'Region VIII - Eastern Visayas',
    provinces: [
      {
        name: 'Leyte',
        municipalities: [
          { name: 'Tacloban City', barangays: ['Bagacay', 'Barangay 1 to 110', 'Caibaan', 'Calanipawan', 'Campetic', 'Diit', 'Marasbaras', 'Nula-tula', 'Palanog', 'Rawis', 'Sagkahan', 'Salvacion', 'San Jose', 'San Roque', 'Utap'] },
          { name: 'Ormoc City', barangays: ['Alegria', 'Bagong Buhay', 'Bantigue', 'Batuan', 'Biliboy', 'Cogon', 'Concepcion', 'Dolores', 'Esperanza', 'Ipil', 'Juaton', 'Lao', 'Libertad', 'Lilio', 'Linao', 'Mabini', 'Macabug', 'Naungan', 'Punta', 'San Jose', 'San Pablo', 'Valencia'] },
          { name: 'Baybay City', barangays: ['Altavista', 'Ambacan', 'Amgangan', 'Ampora', 'Balanag', 'Banahao', 'Bambang', 'Bidlinan', 'Bitanhuan', 'Bubon', 'Cogon', 'Ga-as', 'Gabas', 'Hiabay', 'Hilapnitan', 'Ibarra', 'Kiling', 'Lintaon', 'Maganhan', 'Mahaplag', 'Mailhi', 'Matam-is', 'Monte Verde', 'PAGIMASAN', 'Pangasihan', 'Poblacion Zone 1 to 23', 'Punta', 'San Agustin', 'San Isidro', 'Villa Sola'] },
          { name: 'Palo', barangays: ['Anibong', 'Arado', 'Baras', 'Barayong', 'Bato', 'Campetic', 'Candahug', 'Cangumbang', 'Cogon', 'Guindapunan', 'LITON', 'NHA', 'Poblacion Ward 1 to 10', 'Salvacion', 'San Fernando', 'San Jose', 'Santa Cruz'] },
          { name: 'Tanauan', barangays: ['Ada', 'Alang-alang', 'Amanluran', 'Bislig', 'Cabacungan', 'Cabuynan', 'Calogcog', 'Cogon', 'Guingawan', 'Licod', 'Mohon', 'Pagsulhugon', 'Poblacion District 1 to 6', 'Sacme', 'San Roque', 'Santa Cruz', 'Sto. Niño'] },
          { name: 'Abuyog', barangays: ['Bahi', 'Balinsasayao', 'Baras', 'Buenavista', 'Bulak', 'Cadac-an', 'Combis', 'Guinhangdan', 'Libertad', 'Magsayap', 'Nalibunan', 'New Baghdad', 'Old Baghdad', 'Poblacion Zone 1 to 4', 'San Isidro', 'San Roque', 'Tibpuan', 'Tula-tula'] },
          { name: 'Carigara', barangays: ['Balalit', 'Barugohay Norte', 'Barugohay Sur', 'Baybay', 'Binibihan', 'Bislig', 'Cagbalo', 'Camansi', 'Candaguit', 'Canlampay', 'Jugaban', 'Libertad', 'Macalpe', 'Manloy', 'Naugisan', 'Poblacion Jugaban', 'Ponong', 'San Juan', 'Santa Fe', 'Sawang', 'Tagnao', 'Uyawan'] },
        ],
      },
      {
        name: 'Southern Leyte',
        municipalities: [
          { name: 'Maasin City', barangays: ['Abgao', 'Asuncion', 'Bactul I', 'Bactul II', 'Bogo', 'Canturing', 'Combado', 'Hantag', 'Ibarra', 'Isagani', 'Lunas', 'Mambajao', 'Manhilo', 'Mantahan', 'Maria Clara', 'Pasay', 'Poblacion', 'Rizal', 'San Rafael', 'Tagnipa', 'Tawas', 'Tigbawan', 'Tomoy-tomoy', 'Zuma'] },
          { name: 'Sogod', barangays: ['Benit', 'Buac Daku', 'Buac Gamay', 'Cabadbaran', 'Consolacion', 'Dagsa', 'Hibod-hibod', 'Kahupian', 'La Purisima Concepcion', 'Libas', 'Lum-an', 'Mahayahay', 'Malinao', 'Maria Plana', 'Milagrosa', 'Pancho Villa', 'Poblacion Zone 1 to 5', 'Rizal', 'San Isidro', 'San Jose', 'San Martin', 'Suba', 'Tebak'] },
        ],
      },
      {
        name: 'Samar',
        municipalities: [
          { name: 'Catbalogan City', barangays: ['Bagong City', 'Barangay 1 to 13 (Pob.)', 'Basiao', 'BUNUANAN', 'Caglacang', 'Cagmanaba', 'Cagutsan', 'Canlapuran', 'Cogon', 'Guinsorongan', 'Ibol', 'Lagundi', 'Libestad', 'Maqueda', 'Mercedes', 'Moobol', 'Muñaslon', 'PAGSANGHAN', 'Payao', 'Rama', 'San Roque', 'Silanga', 'Socorro'] },
          { name: 'Calbayog City', barangays: ['Acedillo', 'Alicante', 'Amampacang', 'Anislag', 'Ba-ay', 'Bagnaran', 'Bagacay', 'Baluarte', 'Balud', 'Bañadero', 'Basud', 'Biga', 'Bito', 'Bugtong', 'Cabacungan', 'Cag-anibong', 'Cagbapote', 'Cag-olango', 'Calangan', 'Capoocan', 'Carayman', 'Cogon', 'Dagum', 'Dapdap', 'Gadgaron', 'Hamorawon', 'Jose Roño', 'La Paz', 'Lonoy', 'Matobato', 'Obrero', 'PAGATPAT', 'Pajao', 'Poblacion 1 to 15', 'Rizal', 'San Policarpo', 'Tinambacan Norte', 'Tinambacan Sur', 'Trinidad'] },
          { name: 'Basey', barangays: ['Amandayehan', 'Anglit', 'Antipolo', 'Balante', 'Balud', 'Bayanihan', 'Buenavista', 'Burgos', 'Cogon', 'Dolores', 'Guintigui-an', 'Inuntan', 'Mabang', 'May-it', 'Magsaysay', 'New San Agustin', 'Pagsupan', 'Poblacion 1 to 10', 'Rizal', 'San Fernando', 'Serafin', 'Villa Aurora'] },
        ],
      },
      {
        name: 'Eastern Samar',
        municipalities: [
          { name: 'Borongan City', barangays: ['A-dalag', 'Alang-alang', 'Amits', 'Balaure', 'Baybay', 'Beniton', 'Bugas', 'BUtag', 'Cababtoan', 'Cabolian', 'Cahagnaan', 'Camada', 'Can-hired', 'Can-kuran', 'Divinubo', 'Hezro', 'Lalawigan', 'Locso-on', 'Maypangdan', 'Poblacion 1 to 4', 'Punta Maria', 'San Gabriel', 'San Jose', 'San Mateo', 'Santa Fe', 'Sohoton', 'Taboc', 'Tamoso'] },
          { name: 'Guiuan', barangays: ['Alingarog', 'Baras', 'Barangay 1 to 14 (Pob.)', 'Buenavista', 'Cagusu-an', 'Campatoc', 'Cogon', 'Gao', 'Inapulangan', 'Lupok', 'Manicani', 'Pagbabangnan', 'Salug', 'San Antonio', 'San Jose', 'San Pedro', 'Santa Cruz', 'Sulat', 'Tubabao', 'Victoria'] },
        ],
      },
      {
        name: 'Northern Samar',
        municipalities: [
          { name: 'Catarman', barangays: ['Acacia', 'Baybay', 'Bocboc', 'Cawayan', 'Cervantes', 'DAGINAS', 'Dalakit', 'Esperanza', 'Gebulwangan', 'Geduang', 'Libertad', 'Macagtas', 'Makiwalo', 'Mirador', 'Poblacion 1 to 8', 'Polangi', 'San Jose', 'San Pascual', 'Somoge', 'Trinidad', 'UJE', 'Urdaneta'] },
        ],
      },
      {
        name: 'Biliran',
        municipalities: [
          { name: 'Naval', barangays: ['Agpangi', 'Anislagan', 'Atipolo', 'Calipayan', 'Cabungaan', 'Casiawan', 'Catmon', 'Lico', 'Lucsoon', 'Mabini', 'Pagsanghan', 'Poblacion Zone 1 to 5', 'San Pablo', 'Santissimo Rosario', 'Santo Niño', 'Talustusan', 'Villa Caneja', 'Villa Sr.'] },
        ],
      },
    ],
  },

  // ─── 12. Region IX ──────────────────────────────────────────────────────────
  {
    region: 'Region IX - Zamboanga Peninsula',
    provinces: [
      {
        name: 'Zamboanga del Sur',
        municipalities: [
          { name: 'Zamboanga City', barangays: ['Abong-Abong', 'Arena Blanco', 'Ayala', 'Baliwasan', 'Baluno', 'Boalan', 'Bolong', 'Buenavista', 'Bunguiao', 'Busay', 'Cabatangan', 'Cacao', 'Calarian', 'Camino Nuevo', 'Campo Islam', 'Canelar', 'Capisan', 'Cawit', 'Culianan', 'Curuan', 'Dita', 'Divisoria', 'Dulian', 'Guisao', 'Guiwan', 'Kasanyangan', 'Labuan', 'Lamisahan', 'Landang Laum', 'Lanzones', 'Lapakan', 'Licomo', 'Lima-lima', 'Limpapa', 'Lubigan', 'Lumayang', 'Lumbangan', 'Lunzuran', 'Maasin', 'Malagutay', 'Mampang', 'Manicahan', 'Mariki', 'Mercedes', 'Muti', 'Pasobolong', 'Pasonanca', 'Patalon', 'Putik', 'Quiniput', 'Recodo', 'Rio Hondo', 'Salaan', 'San Jose Cawa-Cawa', 'San Jose Gusu', 'San Roque', 'Sangali', 'Santa Barbara', 'Santa Catalina', 'Santa Maria', 'Santo Niño', 'Sibulao', 'Sinunuc', 'Talabaan', 'Talon-Talon', 'Taluksangay', 'Tetuan', 'Tictapul', 'Tigbalabag', 'Tigtabon', 'Tolosa', 'Tugbungan', 'Tumaga', 'Vitali', 'Zambowood'] },
          { name: 'Pagadian City', barangays: ['Alegria', 'Balangasan', 'Baloyboan', 'Bomba', 'Buenavista', 'Bulatok', 'Campo Islam', 'Dano', 'Datagan', 'Deborok', 'Dingalen', 'Dumalinao', 'Gisukan', 'Guba', 'Kawit', 'KIPIT', 'Kukapan', 'Lala', 'Lapulik', 'Lenienza', 'Lourdes', 'Lower Sibatani', 'Macasing', 'Muricay', 'Napolan', 'Poblacion', 'San Francisco', 'San Jose', 'San Pedro', 'Santa Lucia', 'Santiago', 'Santo Niño', 'Tiguma', 'Tuburan'] },
        ],
      },
      {
        name: 'Zamboanga del Norte',
        municipalities: [
          { name: 'Dipolog City', barangays: ['Bararra', 'Biasong', 'Central', 'Cogon', 'Dicayas', 'Diwan', 'Estaka', 'Galas', 'Gulayon', 'Lugdungan', 'Miputak', 'Olingan', 'Punta', 'San Jose', 'San Nicole', 'Santa Filomena', 'Santa Isabel', 'Sicayab', 'Sinaman', 'Turno'] },
          { name: 'Dapitan City', barangays: ['Alvenda', 'Aseniero', 'Ba-ao', 'Bagting', 'Banbanan', 'Barcelona', 'Bayanihan', 'Burgos', 'Canactac', 'Cawa-Cawa', 'Dampalan', 'Dawo', 'Ilaya', 'Maria Cristina', 'Opao', 'Poblacion', 'Potungan', 'San Francisco', 'San Pedro', 'Santa Cruz', 'Santo Niño', 'Sicayab Bocana', 'Sulat', 'Talisay'] },
          { name: 'Sindangan', barangays: ['Bantayan', 'BIDS', 'Bitoon', 'Bucana', 'Calatunan', 'Calubian', 'Disitad', 'Datu Mamang', 'Fatima', 'Inalad', 'Joaquin Macias', 'La Concepcion', 'La Roche', 'Labak', 'Mandih', 'Misok', 'Nipaan', 'Poblacion', 'Panglit', 'Santo Niño', 'Tigbao'] },
        ],
      },
      {
        name: 'Zamboanga Sibugay',
        municipalities: [
          { name: 'Ipil', barangays: ['Bacalan', 'Bangi', 'Buluan', 'Caparan', 'Domining', 'Don Andres', 'Guituan', 'Ipil Heights', 'Labuahan', 'Lower Ipil', 'Luyahan', 'Magdaup', 'Makilas', 'Poblacion', 'San Vito', 'Tenan', 'Tiabon', 'Taway', 'Veteran\'s Village'] },
          { name: 'Kabasalan', barangays: ['Banker', 'Boliong', 'Buayan', 'Canacan', 'Concepcion', 'Dulong Bayan', 'F.L. Peña', 'Goodyear', 'Kagasangan', 'Linguisan', 'Poblacion', 'Salintapan', 'San Antonio', 'Santa Cruz', 'Sayao', 'Tigbao', 'Timuay Danda'] },
        ],
      },
      {
        name: 'Basilan',
        municipalities: [
          { name: 'Isabela City', barangays: ['Aguada', 'Balatanay', 'Baluno', 'Begang', 'Binuangan', 'Busay', 'Cabunbata', 'Cacao', 'Calvario', 'East Sakayan', 'Kaumpurnah Zone 1 to 3', 'Kuminlang', 'La Paz', 'Lampinigan', 'Lumbang', 'Makiri', 'Marang-marang', 'Menzi', 'Panunsulan', 'Poblacion', 'Port Holland', 'San Rafael', 'Santa Barbara', 'Santa Cruz', 'Tabiawan', 'Tabuk', 'Tampalan'] },
        ],
      },
    ],
  },

  // ─── 13. Region X ───────────────────────────────────────────────────────────
  {
    region: 'Region X - Northern Mindanao',
    provinces: [
      {
        name: 'Misamis Oriental',
        municipalities: [
          { name: 'Cagayan de Oro City', barangays: ['Agusan', 'Baikingon', 'Balubal', 'Balulang', 'Barra', 'Bayabas', 'Bayanga', 'Besigan', 'Bonbon', 'Bugo', 'Bulua', 'Camaman-an', 'Canitoan', 'Carmen', 'Consolacion', 'Cugman', 'Dansolihon', 'F.S. Catanico', 'Gusa', 'Indahag', 'Iponan', 'Kauswagan', 'Lapasan', 'Lumbia', 'Macabalan', 'Macasandig', 'Mambuaya', 'Nazareth', 'Pagalungan', 'Pagatpat', 'Patag', 'Puntod', 'San Simon', 'Taglimao', 'Tagpangi', 'Tignapoloan', 'Tuburan', 'Tumpagon'] },
          { name: 'El Salvador City', barangays: ['Amoros', 'Bolisong', 'Bolisong Lower', 'Calongonan', 'Cogon', 'Himaya', 'Hinumboan', 'Kibonbon', 'Molugan', 'Poblacion', 'Quibonbon', 'Sambulawan', 'Sinaloc', 'Taytay', 'Uzon'] },
          { name: 'Gingoog City', barangays: ['Agay-ayan', 'Alviola', 'Anakan', 'Bagubad', 'Bakid-bakid', 'Balangad', 'Balingasag', 'Blanko', 'Binakalan', 'Cala-cala', 'Daan Lungsod', 'Kalisangan', 'Lunao', 'Malimbato', 'Murallon', 'Odiongan', 'Poblacion 1 to 26', 'PUNTA', 'San Jose', 'San Martin', 'Samilang', 'Talisayan'] },
          { name: 'Balingasag', barangays: ['Baliwagan', 'Bayanihan', 'Blanco', 'Calawag', 'Camamawan', 'Cogon', 'Dansuli', 'Duka', 'Hermano', 'Linabu', 'Linggangao', 'Mandangoa', 'Napaliran', 'Poblacion 1 to 6', 'San Isidro', 'San Juan', 'Waterfall'] },
          { name: 'Tagoloan', barangays: ['Baluarte', 'Casinglot', 'Mohon', 'Natumolan', 'Poblacion', 'Santa Ana', 'Santa Cruz', 'Sugbongcogon', 'Tagoloan'] },
          { name: 'Villanueva', barangays: ['Balacanas', 'Dayawan', 'Imelda', 'Katipunan', 'Kimaya', 'Poblacion 1 to 3', 'San Martin'] },
        ],
      },
      {
        name: 'Lanao del Norte',
        municipalities: [
          { name: 'Iligan City', barangays: ['Abuno', 'Acmac', 'Bagong Silang', 'Buru-un', 'Calaunan', 'Dalipuga', 'Del Carmen', 'Digkilaan', 'Ditucalan', 'Dulag', 'Hinaplanon', 'Hindang', 'Kabacsanan', 'Kalilangan', 'Kiwalan', 'Lanipao', 'Luinab', 'Mahayahay', 'Mainit', 'Maria Cristina', 'Pala-o', 'Poblacion', 'Puga-an', 'San Banito', 'San Miguel', 'San Roque', 'Santa Filomena', 'Suarez', 'Tambacan', 'Tibanga', 'Tubod', 'Ubaldo Laya', 'Upper Hinaplanon', 'Villa Verde'] },
          { name: 'Tubod', barangays: ['Barakan', 'Baroy', 'Camp 5', 'Candis', 'Canawy', 'Dalama', 'Kakai Renabor', 'Kalilangan', 'Lala', 'Malingao', 'Poblacion', 'Pualas', 'San Cruz', 'Taden', 'Tangue', 'Tubod'] },
          { name: 'Kapatagan', barangays: ['Bagong Silang', 'Barauntong', 'Bel-is', 'Buenavista', 'De Asis', 'Inudaran', 'Kawayan', 'Kidipid', 'Lantawan', 'Mahayahay', 'Maranding', 'Poblacion', 'San Isidro', 'San Vicente', 'Santa Cruz', 'Tacub', 'Tipolo', 'Waterfalls'] },
        ],
      },
      {
        name: 'Bukidnon',
        municipalities: [
          { name: 'Malaybalay City', barangays: ['Aglayan', 'Amueg', 'Apo Macote', 'Bantangan', 'Bangcud', 'Bontongon', 'Busdi', 'Cabanglasan', 'Caburacanan', 'Can-ayan', 'Capitan Angel', 'Casisang', 'Dalwangan', 'Imbayao', 'Indalasa', 'Kalasungay', 'Kibalabag', 'Kulaman', 'Laguitas', 'Linabo', 'Lumpanama', 'Managok', 'Mapayag', 'Mapulo', 'Miglamin', 'Poblacion 1', 'Poblacion 2', 'Poblacion 3', 'Poblacion 4', 'Poblacion 5', 'Poblacion 6', 'Poblacion 7', 'Poblacion 8', 'Poblacion 9', 'Poblacion 10', 'Poblacion 11', 'Saint Peter', 'San Jose', 'San Martin', 'Sinanglanan', 'Sumpong', 'Violeta', 'Zamboanguita'] },
          { name: 'Valencia City', barangays: ['Bagontaas', 'Banlag', 'Barobo', 'Batangan', 'Catumbalon', 'Colonia', 'Concepcion', 'Dagat-Kidapawan', 'Guinoyuran', 'Kahapunan', 'Laligan', 'Lilingayon', 'Lourdes', 'Lumbo', 'Lurogan', 'Maapag', 'Mabuhay', 'Mailag', 'Mount Nebo', 'Poblacion', 'San Carlos', 'San Isidro', 'San Martin', 'Sinabuagan', 'Sinayawan', 'Sugod', 'Tongantongan', 'Tugaya', 'Vintar'] },
          { name: 'Baungon', barangays: ['Balintad', 'Danatag', 'Imbatug (Poblacion)', 'Kalasugay', 'Licoan', 'Lingating', 'Mabuhay', 'Nicdao', 'Pambabuaya', 'Poblacion', 'Salimbalan', 'San Jose', 'San Vicente', 'Santa Cruz'] },
          { name: 'Cabanglasan', barangays: ['Anlogan', 'Cabulohan', 'Canangaan', 'Capitan Juan', 'Iba', 'Imbatug', 'Jasaan', 'Lambangan', 'Mandaluwas', 'Mauswagon', 'Paradise', 'Poblacion'] },
          { name: 'Damulog', barangays: ['Alang-alang', 'Encarnacion', 'Kibatang', 'Kinangkip', 'Maangob', 'Migcawayan', 'New MCO', 'Poblacion', 'Pocopoco', 'Sampagar', 'San Isidro', 'Tangkulan'] },
          { name: 'Dangcagan', barangays: ['Barongcot', 'Bugovac', 'Capitan Juan', 'Dolorosa', 'Kioki', 'Mampayag', 'Miaray', 'Osmeña', 'Poblacion', 'Sagbayan', 'San Vicente', 'Santo Niño'] },
          { name: 'Don Carlos', barangays: ['Cabracan', 'Don Carlos Norte', 'Don Carlos Sur (Poblacion)', 'Embayao', 'Kalangahan', 'Kalubihon', 'Kasapa', 'Kawawasan', 'Kiara', 'Kibatang', 'Mahayahay', 'Manocan', 'Maraymaray', 'New Visayas', 'Old Nongnongan', 'Pualas', 'San Antonio East', 'San Antonio West', 'San Nicolas', 'San Roque', 'Sinangguyan'] },
          { name: 'Impasugong', barangays: ['Bontongon', 'Capitan Bayong', 'Cawayan', 'Dumalaguing', 'Guihean', 'Hagpa', 'Impalutao', 'Kalabugao', 'Kibenton', 'La Fortuna', 'Poblacion', 'Sayawan'] },
          { name: 'Kadingilan', barangays: ['Balaoro', 'Baroy', 'Cabadiangan', 'Central (Poblacion)', 'Husayan', 'Kibangay', 'Kibalabag', 'Mabuhay', 'Matangala', 'Pay-as', 'Salvacion', 'San Vicente', 'Sibonga'] },
          { name: 'Kalilangan', barangays: ['Banga', 'Canituan', 'Centrala (Poblacion)', 'Lampanusan', 'Macabling', 'Malinao', 'Ninatao', 'Pamotolon', 'Public', 'Robocon', 'San Vicente', 'West Kibaritan'] },
          { name: 'Kibawe', barangays: ['Balintawak', 'Cagawasan', 'East Kibawe (Poblacion)', 'Gutierrez', 'Kiorao', 'Labuagon', 'Magsaysay', 'Marapangi', 'Masimu', 'Natulungan', 'New Kidapawan', 'Old Kibawe', 'Palma', 'Romagook', 'Sampaguita', 'San Lorenzo', 'Spring', 'Talahiron', 'West Kibawe'] },
          { name: 'Kitaotao', barangays: ['Balangvie', 'Bobong', 'Bolte', 'Cabubuhan', 'Calapaan', 'Digongan', 'Kahusayan', 'Kauyonan', 'Kimongkit', 'Kitaotao (Poblacion)', 'Kitaihon', 'Kitohoy', 'Metitan', 'Pito-an', 'Poblacion', 'Sinuda', 'Tan-Awan'] },
          { name: 'Lantapan', barangays: ['Alanib', 'Baclayon', 'Balila', 'Bantuanon', 'Basak', 'Bugcaon', 'Capitan Juan', 'Cawayan', 'Ka-atoan', 'Kibangay', 'Kulasihan', 'Poblacion', 'Songco', 'Victory'] },
          { name: 'Libona', barangays: ['Capihan', 'Crossing', 'Kiliog', 'Laturan', 'Luna', 'Maambong', 'Palabao', 'Poblacion', 'Pongol', 'San Jose', 'Santa Cruz', 'Sil-angon'] },
          { name: 'Malitbog', barangays: ['Kauswagan', 'Kiabo', 'Mindagat', 'Omonay', 'Patpat', 'Poblacion', 'Sampiano', 'San Luis', 'Santa Ines', 'Siloo', 'Sumalsag'] },
          { name: 'Manolo Fortich', barangays: ['Alae', 'Dahilayan', 'Dalirig', 'Guihean', 'Kalasungay', 'Lingion', 'Lunocan', 'Maluko', 'Mambour', 'Mambatangan', 'Minsuro', 'Poblacion', 'Sankanan', 'San Miguel', 'Santiago', 'Santo Niño', 'Tankulan'] },
          { name: 'Maramag', barangays: ['Anoling', 'Base Camp', 'Bayabason', 'Camp 1', 'Danggawan', 'Dologon', 'Kiabo', 'Kuya', 'La Asuncion', 'Panadtalan', 'Poblacion', 'San Miguel', 'San Jose', 'Tubigon'] },
          { name: 'Pangantucan', barangays: ['Adtuyon', 'Bacusanon', 'Bangahan', 'Barandias', 'Concepcion', 'Kibatang', 'Lantay', 'Macapari', 'Maliamag', 'Mendis', 'Nabaliwa', 'New Eden', 'Pigtauranan', 'Poblacion', 'Portulin', 'San Isidro', 'San Jose', 'San Vicente'] },
          { name: 'Quezon', barangays: ['Butong', 'Cebole', 'Cawayan', 'Dumagma', 'Kibatang', 'Laligan', 'Lila', 'Manupali', 'Merangeran', 'Minsamanang', 'Poblacion', 'Puntian', 'Salawagan', 'San Jose', 'Santa Cruz', 'Santa Filomena'] },
          { name: 'San Fernando', barangays: ['Halapitan (Poblacion)', 'Little Baguio', 'Mabuhay', 'Maglamin', 'Matupe', 'Nacabuklid', 'Namnam', 'Palacpacan', 'Sacristan', 'San Jose', 'Santo Domingo', 'Tugop'] },
          { name: 'Sumilao', barangays: ['Culasi', 'Kibatang', 'Kisolon (Poblacion)', 'Lupiagan', 'Mampayag', 'Poblacion', 'Puntian', 'Sanico', 'Vista Villa'] },
          { name: 'Talakag', barangays: ['Basak', 'Bayinna', 'Cacaon', 'Colacing', 'Dagumbaan', 'Dagundalahon', 'Indangag', 'Lapok', 'Liguron', 'Lingi-on', 'Miarayon', 'Mirayon', 'Poblacion', 'Sagaran', 'Salucot', 'San Antonio', 'San Isidro', 'San Jose', 'Tagbac', 'Tikalaan'] },
        ],
      },
      {
        name: 'Misamis Occidental',
        municipalities: [
          { name: 'Oroquieta City', barangays: ['Bacolod', 'Bago', 'Balintawak', 'Binuangan', 'Bolibol', 'Buenavista', 'Bunga', 'Clarin Settlement', 'Dolipos Alto', 'Dolipos Bajo', 'Dulapo', 'Lower Langcangan', 'Lower Lamac', 'Mobod', 'Poblacion I & II', 'San Vicente Alto', 'Senate', 'Taboc Norte', 'Taboc Sur', 'Upper Langcangan', 'Villaflor'] },
          { name: 'Ozamiz City', barangays: ['Aguada', 'Bacolod', 'Bagakay', 'Balintawak', 'Banadero', 'Baybay San Roque', 'Baybay Santa Cruz', 'Bongbong', 'Calabayan', 'Carmen', 'Catadman-Manabay', 'Cogon', 'Dalapang', 'Diguan', 'Domalono', 'Gango', 'Gotoc', 'Kinuman Norte', 'Kinuman Sur', 'Labinay', 'Labo', 'Lam-an', 'Lipos', 'Malaubang', 'Maningcol', 'Poblacion', 'Pulot', 'San Antonio', 'San Roque', 'Santa Cruz', 'Tabid', 'Tinago', 'Triunfo'] },
          { name: 'Tangub City', barangays: ['Aquino', 'Balatacan', 'Baluc', 'Banglay', 'Bintana', 'Bocator', 'Bongabong', 'Caniangan', 'Garang', 'Kauswagan', 'Kimat', 'Labuyo', 'Lorenzo Tan', 'Maloro', 'Mantic', 'Migcanaway', 'Poblacion', 'San Antonio', 'San Vicente', 'Santa Cruz', 'Silanga', 'Tiuman', 'Tugabang'] },
        ],
      },
      {
        name: 'Camiguin',
        municipalities: [
          { name: 'Mambajao', barangays: ['Agoho', 'Anito', 'Balbagon', 'Ben Haan', 'Bug-ong', 'Kuguita', 'Magting', 'Naasag', 'Pandan', 'Poblacion', 'Soro-soro', 'Tupsan', 'Yumbing'] },
        ],
      },
    ],
  },

  // ─── 14. Region XI ──────────────────────────────────────────────────────────
  {
    region: 'Region XI - Davao Region',
    provinces: [
      {
        name: 'Davao del Sur',
        municipalities: [
          { name: 'Davao City', barangays: ['1-A to 40-D (Poblacion)', 'Agdao Proper', 'Alambre', 'Alejandra Navarro (Lasang)', 'Alfonso Angliongto Sr.', 'Angalan', 'Bago Aplaya', 'Bago Gallera', 'Bago Oshiro', 'Baganihan', 'Bailan', 'Baji', 'Balengaeng', 'Baliok', 'Bangkas Heights', 'Bangkal', 'Bayanihan', 'Biao Escuela', 'Biao Joaquin', 'Bocana', 'Bucana', 'Buda', 'Buhangin Proper', 'Bunawan Proper', 'Cabantian', 'Cadalian', 'Calinan Proper', 'Callawa', 'Camansi', 'Carmen', 'Catalunan Grande', 'Catalunan Pequeño', 'Centro (San Juan)', 'Communal', 'Crossing Bayabas', 'Dacudao', 'Daliao', 'Daliaon Plantation', 'Datu Salumay', 'Decora', 'Dominga', 'Dumont', 'Dumoy', 'Eden', 'El Gato', 'Fatima', 'Gatungan', 'Gov. Paciano Bangoy', 'Gov. Vicente Duterte', 'Gumalang', 'Gumitan', 'Ilang', 'Indangan', 'Inawayan', 'Kapakipato', 'Kapatalan', 'Kilate', 'Lacson', 'Lamanan', 'Lapu-lapu', 'Lasang', 'Lizada', 'Los Amigos', 'Lumiad', 'Ma-a', 'Mabuhay', 'Madapo', 'Magtuod', 'Mahayag', 'Malabog', 'Malagos', 'Malamba', 'Manambulan', 'Mandug', 'Manuel Guianga', 'Mapula', 'Marapangi', 'Marilog Proper', 'Matina Aplaya', 'Matina Biao', 'Matina Crossing', 'Matina Pangi', 'Megkawayan', 'Mintal', 'Mudiang', 'Mulig', 'Nali', 'New Carmen', 'New Valencia', 'Pampanga', 'Panacan', 'Panalum', 'Pandaitan', 'Pangyan', 'Paquibato Proper', 'Paradise Embac', 'Poblacion', 'Puan', 'Riverside', 'Salapawan', 'Salaysay', 'Saloy', 'San Antonio', 'San Isidro (Bunawan)', 'San Rafael', 'Santa Ana', 'Santo Niño', 'Sasa', 'Sirawan', 'Sirib', 'Suawan', 'Subasta', 'Tacunan', 'Tagakpan', 'Tagluno', 'Tagurano', 'Talandang', 'Talomo Proper', 'Tamayong', 'Tambobong', 'Tamu-an', 'Tawan-tawan', 'Tibatiba', 'Tigatto', 'Toril Proper', 'Tugbok Proper', 'Tungakalan', 'Ula', 'Vicente Hizon Sr.', 'Waan', 'Wangan', 'Wines', 'Wines 2'] },
          { name: 'Digos City', barangays: ['Aplaya', 'Balabag', 'Bato', 'Binaton', 'Cogon', 'Colorado', 'Dawis', 'Dulangan', 'Goma', 'Igpit', 'Kaporon', 'Kiagot', 'Lungag', 'Mahayahay', 'Matti', 'Poblacion Zone 1 to 3', 'Ruparan', 'San Agustin', 'San Jose', 'San Miguel', 'Soong', 'Tiguman', 'Tres De Mayo'] },
          { name: 'Bansalan', barangays: ['Anonang', 'Arsapan', 'Buenavista', 'Cabuay', 'Darapuay', 'Dolo', 'Kinuskusan', 'Libertad', 'Linawan', 'Mabuhay', 'Mabunga', 'Managa', 'Marber', 'New Clarin', 'Poblacion Zone 1 to 2', 'Rizal', 'Santo Niño', 'Tinef', 'Union', 'Viña'] },
          { name: 'Santa Cruz', barangays: ['Astorga', 'Bato', 'Coronon', 'Darong', 'Inawayan', 'Jose Rizal', 'Matutinao', 'Poblacion Zone 1 to 4', 'Saliducon', 'San Jose', 'Sibulan', 'Sinawilan', 'Tagabuli', 'Tibolo', 'Tuban'] },
        ],
      },
      {
        name: 'Davao del Norte',
        municipalities: [
          { name: 'Tagum City', barangays: ['Apokon', 'Bincungan', 'Busaon', 'Canocotan', 'Cuambog', 'Del Pilar', 'Liboganon', 'Magdum', 'Magugpo Poblacion', 'Magugpo East', 'Magugpo North', 'Magugpo South', 'Magugpo West', 'Mankilam', 'New Balamban', 'Nueva Fuerza', 'Pagsabangan', 'Pandapan', 'San Agustin', 'San Isidro', 'San Miguel', 'Visayan Village'] },
          { name: 'Panabo City', barangays: ['A. O. Floirendo', 'Buenavista', 'Cacao', 'Cagangohan', 'Consolacion', 'Dapco', 'Datu Abdul Dadia', 'Datu Balong', 'Gredu', 'J.P. Laurel', 'Kasilak', 'Katipunan', 'Kauswagan', 'Little Panay', 'Malagasang', 'Manay', 'New Malaga', 'New Pandan', 'Poblacion', 'Quezon', 'San Francisco', 'San Nicolas', 'San Pedro', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Tagpore', 'Tibungol'] },
          { name: 'Samal City / IGACOS', barangays: ['Adecor', 'Anonang', 'Bandera', 'Caliclic (Cawag)', 'Camudmud', 'Catagman', 'Cogon', 'Dadatan', 'Del Monte', 'Guintican', 'Kambani', 'Kawas', 'Libertad', 'Limao', 'Linosutan', 'Mambago-A', 'Mambago-B', 'Miranda', 'Moncado (Poblacion)', 'Pangubero', 'Penaplata (Pob.)', 'Poblacion', 'San Agustin', 'San Isidro', 'San Jose', 'Santa Cruz', 'Sion', 'Tagana-an', 'Talicud', 'Tamba', 'Toril', 'Tugbid'] },
          { name: 'Carmen', barangays: ['Alejal', 'Anibongan', 'Asuncion', 'Bale', 'Guadalupe', 'Ising (Poblacion)', 'La Paz', 'Mabaus', 'Mabuhay', 'Magsaysay', 'Manay', 'Minda', 'New Corella', 'San Isidro', 'Santo Niño', 'Taba', 'Tubod'] },
        ],
      },
      {
        name: 'Davao Oriental',
        municipalities: [
          { name: 'Mati City', barangays: ['Badas', 'Bobon', 'Buso', 'Cabuaya', 'Central (Pob.)', 'Culian', 'Dahican', 'Danao', 'Dawan', 'Don Enrique Lopez', 'Don Martin Marundan', 'Don Alejandro', 'Lawaan', 'Libudon', 'Lupon', 'Maag', 'Macambol', 'Mamali', 'Manay', 'Matiao', 'Sainz', 'Sanghay', 'Tagabakid', 'Tagbinonga', 'Talisay'] },
          { name: 'Lupon', barangays: ['Bagumbayan', 'Cabadiangan', 'Calapagan', 'Cocornon', 'Corporacion', 'Don Mariano Marcos', 'Ilangay', 'Langka', 'Lantawan', 'Limbahan', 'Macangao', 'Magsaysay', 'Mahayahay', 'Maragatas', 'Poblacion', 'San Jose', 'Tagugpo'] },
        ],
      },
      {
        name: 'Davao de Oro',
        municipalities: [
          { name: 'Nabunturan', barangays: ['Anislagan', 'Antequera', 'Basak', 'Bayabas', 'Cabacungan', 'Cabidianan', 'Katipunan', 'Libasan', 'Linda', 'Magading', 'Mainit', 'Manat', 'Matilo', 'Magsaysay', 'New Corella', 'Ogao', 'Pagsabangan', 'Poblacion', 'San Isidro', 'San Roque', 'Santa Maria', 'Tagonito'] },
          { name: 'Monkayo', barangays: ['Awao', 'Babag', 'Banlag', 'Baylo', 'Casoon', 'Inambatan', 'Macopa', 'Mamunga', 'Mount Diwata (Diwalwal)', 'Naboc', 'Olaycon', 'Pasian', 'Poblacion', 'Rizal', 'San Jose', 'Tubo-tubo', 'Union'] },
        ],
      },
      {
        name: 'Davao Occidental',
        municipalities: [
          { name: 'Malita', barangays: ['Bito', 'Bolineno', 'Buhangin', 'Culaman', 'Datu Intan', 'Demoloc', 'Felis', 'Fishing Village', 'Kibalat', 'Kidalapong', 'Kilalag', 'Lais', 'Little Baguio', 'Macol', 'Mana', 'New Bataan', 'Pangian', 'Poblacion', 'Pangaleon', 'Sanghay', 'Talong', 'Tical', 'Tubalan'] },
        ],
      },
    ],
  },

  // ─── 15. Region XII ─────────────────────────────────────────────────────────
  {
    region: 'Region XII - SOCCSKSARGEN',
    provinces: [
      {
        name: 'South Cotabato',
        municipalities: [
          { name: 'General Santos City', barangays: ['Apopong', 'Baluan', 'Batomelong', 'Buayan', 'Bula', 'Calumpang', 'City Heights', 'Conel', 'Dadiangas East', 'Dadiangas North', 'Dadiangas South', 'Dadiangas West', 'Fatima', 'Katangawan', 'Labangal', 'Lagao (1st)', 'Lagao (2nd)', 'Lagao (3rd)', 'Ligaya', 'Mabuhay', 'Olympog', 'San Isidro', 'San Jose', 'Sinawal', 'Tambler', 'Tinagacan', 'Upper Labay'] },
          { name: 'Koronadal City', barangays: ['Assumption', 'Avanceña', 'Barrio 1 to 8 (Pob.)', 'Caloocan', 'Carpenter Hill', 'Concepcion', 'Esperanza', 'General Paulino Santos', 'Mabini', 'Magsaysay', 'Morales', 'Namnama', 'New Opon', 'Paraiso', 'Rotonda', 'San Isidro', 'San Jose', 'San Roque', 'Santa Cruz', 'Santo Niño', 'Saravia', 'Zone 1 to 4'] },
          { name: 'Polomolok', barangays: ['Bentung', 'Cannery Site', 'Crossing Pulo', 'Klinan 5 & 6', 'Koronadal Proper', 'Lam-Caliaf', 'Landan', 'Lumakil', 'Maligo', 'Poblacion', 'Puti', 'Salkep', 'Silway 7 & 8', 'Sumbakil', 'Upper Klinan'] },
          { name: 'Surallah', barangays: ['Buenavista', 'Centrala', 'Columbio', 'Dajay', 'Duengas', 'Lamsugod', 'Libertad', 'Moloy', 'Poblacion', 'San Jose', 'Tuburan', 'Talahik', 'Upper Sepaka', 'Vittoria'] },
        ],
      },
      {
        name: 'North Cotabato',
        municipalities: [
          { name: 'Kidapawan City', barangays: ['Amas', 'Amazion', 'Balindog', 'Binoligan', 'Birada', 'Black Water', 'Campo 1', 'Ginatilan', 'Ilomavis', 'Indangan', 'Junction', 'Kalaisan', 'Katipunan', 'Lanao', 'Linangkob', 'Luvimin', 'Macebolig', 'Manterag', 'Meohao', 'Nabalawag', 'New Binoligan', 'Poblacion', 'Puas', 'San Roque', 'Singao', 'Sudapin', 'Sumbao', 'Tumaming'] },
          { name: 'Kabacan', barangays: ['Aringay', 'Bangilan', 'Bannawag', 'BUYOG', 'Buluan', 'Cuyapon', 'Dagupan', 'Katidtuan', 'Kayaga', 'Kilagasan', 'Magaganding', 'Malamote', 'Malangag', 'Osias', 'Poblacion', 'Salapungan', 'Sanggadatu', 'Tacupan'] },
          { name: 'Midsayap', barangays: ['Alegria', 'Anoling', 'Anonang', 'Aratoc', 'Bagumba', 'Baracayo', 'Central Glad', 'Damasak', 'Glad I & II', 'Ilustre', 'Kadigasan', 'Katingawan', 'Kimines', 'Lomopog', 'Lower Glad', 'Malamote', 'Mudzing', 'Nabalawag', 'Patestada', 'Poblacion 1 to 8', 'Range', 'Salunayan', 'Sambulawan', 'San Antonio', 'Santa Cruz', 'TUMBRAS', 'Villarica'] },
          { name: 'M\'lang', barangays: ['Bagontapay', 'Bialong', 'Buayan', 'Calao', 'Dugong', 'Gaunan', 'Inac', 'Katipunan', 'La Fortune', 'Lepaga', 'Luz Village', 'Magpet', 'New Antique', 'New Janiuay', 'Poblacion A & B', 'Sangat', 'Tawan-tawan', 'TIBAO'] },
        ],
      },
      {
        name: 'Sultan Kudarat',
        municipalities: [
          { name: 'Tacurong City', barangays: ['Baras', 'Buenaflor', 'Calean', 'E. Alegado', 'Gansing', 'Happy Valley', 'Kalandagan', 'Katipunan', 'Laguinding', 'Lancheta', 'Lower Katungal', 'New Isabela', 'New Lagao', 'New Passi', 'Old Isabela', 'Poblacion', 'Rajahnuda', 'San Antonio', 'San Emmanuel', 'San Pablo', 'San Rafael', 'Tina', 'Upper Katungal'] },
          { name: 'Isulan', barangays: ['Bambad', 'Bual', "D'Sull", 'Impao', 'Kalawag I to III', 'Lagandang', 'Laguilayan', 'Mapillia', 'New Pangasinan', 'Poblacion', 'Sampao', 'Tayugo'] },
        ],
      },
      {
        name: 'Sarangani',
        municipalities: [
          { name: 'Alabel', barangays: ['Alegria', 'Bagacay', 'Baluntay', 'Datal Anggas', 'Kawas', 'Ladol', 'Maribulan', 'Pag-asa', 'Paraiso', 'Poblacion', 'Spring', 'Tokawal'] },
          { name: 'Glan', barangays: ['Baliton', 'Batulaki', 'Big Margus', 'Burias', 'Cabcaben', 'Calapatan', 'Cross', 'Gimitan', 'Kango', 'Lagundi', 'Pangyan', 'Poblacion', 'Small Margus', 'Taluya', 'Tango'] },
        ],
      },
      {
        name: 'Maguindanao del Norte',
        municipalities: [
          { name: 'Cotabato City', barangays: ['Bagua I to III', 'Kalanganan I & II', 'Poblacion I to IX', 'Rosary Heights I to XIII', 'Tamontaka I to V'] },
        ],
      },
    ],
  },

  // ─── 16. Region XIII ────────────────────────────────────────────────────────
  {
    region: 'Region XIII - Caraga',
    provinces: [
      {
        name: 'Agusan del Norte',
        municipalities: [
          { name: 'Butuan City', barangays: ['Agusan Pequeño', 'Amparo', 'Ampayon', 'Anticala', 'Antongalon', 'Aupagan', 'Baan KM 3', 'Baan Riverside', 'Babag', 'Bading', 'Bancasi', 'Banza', 'Baobaoan', 'Basag', 'Bayanihan', 'Bilay', 'Bitan-agan', 'Bit-os', 'Bobon', 'Bonbon', 'Bugabus', 'Buhisan', 'Bunga', 'Cabadbaran', 'Camayahan', 'Dagohoy', 'De Oro', 'Diego Silang', 'Don Francisco', 'Doongan', 'Dulag', 'Dumalagan', 'Florida', 'Golden Ribbon', 'Holy Redeemer', 'Humabon', 'Imadejas', 'Jose Rizal', 'Kinamlutan', 'Lapu-lapu', 'Lemon', 'Libertad', 'Los Angeles', 'Lumbocan', 'Maguinda', 'Mahay', 'Mahogany', 'Manila de Bugabus', 'Maningalao', 'Masao', 'Maon', 'Maug', 'New Society', 'Nong-nong', 'Obrero', 'Ong Yiu', 'Pagatpat', 'Pangabugan', 'Pangabugan East', 'Pinamanculan', 'Port Poyohon', 'Rajah Soliman', 'San Ignacio', 'San Mateo', 'San Vicente', 'Santa Cruz', 'Santo Niño', 'Sikatuna', 'Silongan', 'Sumile', 'Sumilihon', 'Tagabaca', 'Taguibo', 'Taligaman', 'Tiniwisan', 'Tungao', 'Urduja', 'Villa Kananga'] },
          { name: 'Cabadbaran City', barangays: ['Antonio Luna', 'Bayanihan', 'Cabinet', 'Calamba', 'Calius', 'Comagascas', 'Concepcion', 'Del Pilar', 'Katugasan', 'Kauswagan', 'La Union', 'Mabini', 'Poblacion 1 to 12', 'Pangabugan', 'Puting Daito', 'San Antonio', 'Sanghan', 'Soriano', 'Toga'] },
          { name: 'Nasipit', barangays: ['Aclan', 'Amontay', 'Apas', 'Bayanihan', 'Camagong', 'Cub-cub', 'Culit', 'Jaguimitan', 'Kinabjang', 'Poblacion 1 to 7', 'Punta', 'Santa Ana', 'Talisay', 'Triangulo'] },
        ],
      },
      {
        name: 'Agusan del Sur',
        municipalities: [
          { name: 'Bayugan City', barangays: ['Afga', 'Agay-ayan', 'Alegria', 'Ampatuan', 'Anos', 'Berseba', 'Bucac', 'Cagbas', 'Canayong', 'Clavite', 'Clearwater', 'Filingue', 'Gethsemane', 'Grace Estate', 'Kiamo', 'Mabuhay', 'Magpet', 'Maygatasan', 'Monte Vista', 'Montievideo', 'Noli', 'Poblacion', 'Sagmone', 'Salimbalan', 'San Agustin', 'San Isidro', 'San Juan', 'Santa Irene', 'Taglatawan', 'Verdu', 'Wa-ang'] },
          { name: 'Prosperidad', barangays: ['Azpetia', 'Basa', 'Cabadbaran', 'La Caridad', 'La Suerte', 'La Union', 'Las Olivas', 'Lucena', 'Mabuhay', 'Magsaysay', 'Napo', 'Poblacion', 'Salimbogaon', 'San Joaquin', 'San Jose', 'San Lorenzo', 'San Martin', 'San Pedro', 'San Rafael', 'Santa Irene', 'Santo Niño'] },
          { name: 'San Francisco', barangays: ['Alegria', 'Barangay 1 to 5 (Pob.)', 'Badas', 'Bautista', 'Borbon', 'Cagawasan', 'Caimpuogan', 'Ebro', 'Hubang', 'Karaos', 'Ladgadan', 'Lapinigan', 'Lucac', 'Mate', 'New Horizon', 'Pisa-an', 'Rizal', 'San Isidro', 'Santa Ana', 'Tagapua'] },
        ],
      },
      {
        name: 'Surigao del Norte',
        municipalities: [
          { name: 'Surigao City', barangays: ['Alang-alang', 'Alegria', 'Anomar', 'Arellano', 'Balibayon', 'Baybay', 'Bilabid', 'Bitaugan', 'Cagutsan', 'Canlanipa', 'Cantiasay', 'Cogon', 'Danipel', 'Ipil', 'Lipata', 'Luna', 'Mabua', 'Mabuhay', 'Mapawa', 'Mat-i', 'Nabago', 'Orok', 'Poctoy', 'Rizal', 'Sabang', 'San Juan', 'San Pedro', 'Santa Cruz', 'Taft', 'Togbongon', 'Washington', 'Zaragoza'] },
        ],
      },
      {
        name: 'Surigao del Sur',
        municipalities: [
          { name: 'Tandag City', barangays: ['Awasan', 'Bagong Lungsod', 'Biabon', 'Bongtod', 'Buenavista', 'Cagwait', 'Dagocdoc', 'Maitum', 'Mabua', 'Mabuhay', 'Pangi', 'Poblacion', 'San Agustin', 'San Antonio', 'San Jose', 'Telaje'] },
          { name: 'Bislig City', barangays: ['Bucto', 'Burboanan', 'Cahayagan', 'Camba', 'Coleto', 'Comawas', 'Kahayag', 'Labisma', 'Lawigan', 'Maharlika', 'Mangagoy', 'Mone', 'Pamanlinan', 'Pangyan', 'Poblacion', 'San Fernando', 'San Jose', 'San Vicente', 'Santa Cruz', 'Tabon', 'Tumanan'] },
        ],
      },
    ],
  },

  // ─── 17. BARMM ──────────────────────────────────────────────────────────────
  {
    region: 'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao',
    provinces: [
      {
        name: 'Lanao del Sur',
        municipalities: [
          { name: 'Marawi City', barangays: ['Amito Marantao', 'Banggolo Poblacion', 'Barionaga', 'Basak Malutlut', 'Beyaba-Damag', 'Bito Buadi Itowa', 'Bito Buadi Parba', 'Boganga', 'Bubong Madaya I & II', 'Cadayonan', 'Cormatan', 'Daguduban', 'Datu Sa Dansalan', 'East Basak', 'Emie Punud', 'Fort', 'Gadongan', 'Guimba', 'Kipai', 'Kilala', 'Lagasan', 'Lalabuan', 'Lilod Madaya', 'Lilod Saduc', 'Lomidong', 'Lumbac Marinaut', 'Lumbaca Madaya', 'Matampay', 'Moncado Colony', 'Navarro', 'Panggao Saduc', 'Papandayan', 'Poblacion', 'Poona Marantao', 'Raya Madaya', 'Saduc', 'Sangcay Dansalan', 'South Madaya', 'TAMPARAN', 'Tuca'] },
        ],
      },
      {
        name: 'Basilan',
        municipalities: [
          { name: 'Lamitan City', barangays: ['Arcoverde', 'Ba-as', 'Baimbing', 'Balagtasan', 'Balas', 'Balimbing', 'Buahan', 'Bulanting', 'Bunga', 'Calugusan', 'Campo Uno', 'Colonia', 'Cruz', 'Guiong', 'KULAY-KULAY', 'Lahi', 'Lebbuh', 'Limook', 'Lo-ok', 'Lumbog', 'Malinis', 'Manündün', 'Matibay', 'Matibug', 'PAG-ASA', 'Parangbasak', 'SABONG', 'Santa Clara', 'Simbahan', 'Taburung', 'Tugui'] },
        ],
      },
      {
        name: 'Sulu',
        municipalities: [
          { name: 'Jolo', barangays: ['Asturias', 'Alkas', 'Bawisan', 'Bus-bus', 'Chinese Pier', 'Kagay', 'Kapitang Bato', 'Kauncaran', 'Kilometer 2', 'Kilometer 4', 'Kuhay', 'Laminusa', 'Lansangan', 'Licup', 'Lubid', 'Maligay', 'Mauboh', 'Poblacion', 'San Raymundo', 'Takut-takut', 'Toolan', 'Walled City'] },
        ],
      },
      {
        name: 'Tawi-Tawi',
        municipalities: [
          { name: 'Bongao', barangays: ['Bongao Poblacion', 'Ipil', 'Kamabu', 'Lakit-Lakit', 'Lamion', 'Lato', 'Luuk Buntal', 'Luuk Pandan', 'Luuk Tulay', 'Masakit', 'Nalil', 'Pagasinan', 'Pahut', 'Pakias', 'Panglima Misuari', 'Sapa', 'Simunul', 'Sitangkai', 'SOW', 'Tarawakan', 'Tubbatan', 'Ungus-Ungus'] },
        ],
      },
      {
        name: 'Maguindanao del Norte',
        municipalities: [
          { name: 'Parang', barangays: ['BAGOINGED', 'Comon', 'Datu Gayang', 'Gumaga', 'Kabalukan', 'Kalaing', 'Kidalapong', 'Liton', 'Magsaysay', 'Manili', 'Nituan', 'Orandang', 'Parang Poblacion', 'Pinantao', 'Polloc', 'Sapad', 'Tucao'] },
          { name: 'Sultan Kudarat', barangays: ['Alamada', 'Banubo', 'Bulalo', 'Dalumangcob', 'Datu Macarimbang', 'Inug-ug', 'Katuli', 'Kawit', 'Macaas', 'Matungao', 'Neco', 'Nuling Poblacion', 'Pigcalagan', 'Pinaring', 'Salimbao', 'Tiguma'] },
        ],
      },
    ],
  },
];

/** Returns all region names in official Philippine order. */
export function getRegions(): string[] {
  return PHILIPPINE_LOCATIONS.map((l) => l.region);
}

/** Returns all province names for a given region. */
export function getProvinces(regionName: string): string[] {
  const loc = PHILIPPINE_LOCATIONS.find((l) => l.region === regionName);
  if (!loc || loc.provinces.length === 0) return [];
  return loc.provinces.map((p) => p.name);
}

/** Returns all municipality names for a given region + province pair. */
export function getMunicipalities(regionName: string, provinceName: string): string[] {
  const loc = PHILIPPINE_LOCATIONS.find((l) => l.region === regionName);
  if (!loc) return [];
  const prov = loc.provinces.find((p) => p.name === provinceName);
  if (!prov || prov.municipalities.length === 0) return [];
  return prov.municipalities.map((m) => m.name);
}

/** Returns all barangay names for a given region + province + municipality. */
export function getBarangays(regionName: string, provinceName: string, municipalityName: string): string[] {
  const loc = PHILIPPINE_LOCATIONS.find((l) => l.region === regionName);
  if (!loc) return [];
  const prov = loc.provinces.find((p) => p.name === provinceName);
  if (!prov) return [];
  const mun = prov.municipalities.find((m) => m.name === municipalityName);
  if (!mun || mun.barangays.length === 0) return [];
  return mun.barangays;
}
