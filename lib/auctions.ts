export type Lot = {
  id: string
  title: string
  subtitle: string
  image: string
  year: number
  mileage: string
  engine: string
  location: string
  currentBid: number
  bidStep: number
  bids: number
  endsInSec: number
  hot?: boolean
  condition: string
  vin: string
}

// Курс условный, цены в BYN (белорусский рубль)
export const lots: Lot[] = [
  {
    id: 'bmw-m5',
    title: 'BMW M5 Competition',
    subtitle: 'F90 · xDrive · Carbon пакет',
    image: '/cars/bmw-m5.png',
    year: 2021,
    mileage: '48 200 км',
    engine: '4.4 V8 · 625 л.с.',
    location: 'Минск',
    currentBid: 189500,
    bidStep: 500,
    bids: 34,
    endsInSec: 1 * 3600 + 42 * 60 + 18,
    hot: true,
    condition: 'Отличное',
    vin: 'WBSJF0C0*L*B12934',
  },
  {
    id: 'mercedes-g',
    title: 'Mercedes-Benz G 63 AMG',
    subtitle: 'W463 · Designo · Night Package',
    image: '/cars/mercedes-g.png',
    year: 2022,
    mileage: '31 400 км',
    engine: '4.0 V8 Biturbo · 585 л.с.',
    location: 'Минск',
    currentBid: 312000,
    bidStep: 1000,
    bids: 51,
    endsInSec: 3 * 3600 + 12 * 60 + 5,
    hot: true,
    condition: 'Идеальное',
    vin: 'W1N4632*N*X98120',
  },
  {
    id: 'audi-rs6',
    title: 'Audi RS6 Avant',
    subtitle: 'C8 · Quattro · Dynamic Plus',
    image: '/cars/audi-rs6.png',
    year: 2020,
    mileage: '62 900 км',
    engine: '4.0 V8 TFSI · 600 л.с.',
    location: 'Брест',
    currentBid: 168750,
    bidStep: 500,
    bids: 27,
    endsInSec: 5 * 3600 + 3 * 60 + 44,
    condition: 'Отличное',
    vin: 'WUA1CBF2*L*N04471',
  },
  {
    id: 'porsche-911',
    title: 'Porsche 911 Carrera S',
    subtitle: '992 · Sport Chrono · PDK',
    image: '/cars/porsche-911.png',
    year: 2023,
    mileage: '12 100 км',
    engine: '3.0 Flat-6 · 450 л.с.',
    location: 'Минск',
    currentBid: 254300,
    bidStep: 1000,
    bids: 42,
    endsInSec: 2 * 3600 + 28 * 60 + 9,
    hot: true,
    condition: 'Идеальное',
    vin: 'WP0AB2A9*P*S71155',
  },
  {
    id: 'range-rover',
    title: 'Range Rover Autobiography',
    subtitle: 'L460 · P530 · Meridian',
    image: '/cars/range-rover.png',
    year: 2022,
    mileage: '39 800 км',
    engine: '4.4 V8 · 530 л.с.',
    location: 'Гомель',
    currentBid: 287900,
    bidStep: 1000,
    bids: 38,
    endsInSec: 6 * 3600 + 51 * 60 + 30,
    condition: 'Отличное',
    vin: 'SALGA2A**N*A28714',
  },
  {
    id: 'tesla',
    title: 'Tesla Model S Plaid',
    subtitle: 'AWD · 1020 л.с. · Full Self-Driving',
    image: '/cars/tesla.png',
    year: 2023,
    mileage: '18 500 км',
    engine: '3 мотора · 1020 л.с.',
    location: 'Минск',
    currentBid: 198400,
    bidStep: 500,
    bids: 46,
    endsInSec: 0 * 3600 + 34 * 60 + 12,
    hot: true,
    condition: 'Идеальное',
    vin: '5YJSA1E6*P*F41200',
  },
  {
    id: 'toyota-camry',
    title: 'Toyota Camry 3.5 Executive',
    subtitle: 'XV70 · JBL · Полный пакет',
    image: '/cars/toyota-camry.png',
    year: 2021,
    mileage: '74 300 км',
    engine: '3.5 V6 · 249 л.с.',
    location: 'Витебск',
    currentBid: 78600,
    bidStep: 250,
    bids: 19,
    endsInSec: 8 * 3600 + 17 * 60 + 55,
    condition: 'Хорошее',
    vin: 'JTNB11HK*M*3009821',
  },
]

export const brands = [
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Porsche',
  'Land Rover',
  'Tesla',
  'Toyota',
  'Lexus',
  'Volkswagen',
  'Volvo',
]

export const stats = [
  { value: '12 400+', label: 'проданных авто' },
  { value: '98,6%', label: 'успешных сделок' },
  { value: '6 областей', label: 'по всей Беларуси' },
  { value: '4 дня', label: 'средний срок сделки' },
]
