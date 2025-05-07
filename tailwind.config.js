module.exports = {
  content: [
    "./views/**/*.{ejs,html,js}",
    "./public/javascripts/**/*.{ejs,html,js}",
  ],
  theme: {
    screens: {
      'xs': '440px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        'bodyColor': '#EEEDDE',
        'navbar': '#203239',
        'secondaryColor': '#E0DDAA',
        'successAdd': '#86EFAC',
        'successDel': '#86EFAC'
      },
      fontFamily: {
        secular: ['Secular One'],
        roboto: ['Roboto'],
        russoOne: ['Russo One'],
        miriamLibre: ['Miriam Libre'],
      },
      backgroundImage: {
        'carousel': "url('/public/book.png')",
      },
      gridRowEnd: {
        '22': '26',
        '33': '33',

      },
      screens: {

      },
    },
  },
  plugins: [],
}
