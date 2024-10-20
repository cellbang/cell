import { defineConfig, presetAttributify, presetTypography, presetUno } from 'unocss'

export default defineConfig({
    presets: [
        presetUno(),
        presetTypography(),
        presetAttributify()
    ],
})
