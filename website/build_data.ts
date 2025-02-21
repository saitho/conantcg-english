// This script builds the card data
// Data from official website may be incomplete, so we need to merge our additional data in there

import fs from "fs";
import path from "path";
import deepmerge from "deepmerge";

const jsonSourceFiles = [
    'cards_ja',
    'categories_ja',
    'products_ja',
    'illustrators_ja',
    'colors_ja',
    'types_ja'
]

for (const file of jsonSourceFiles) {
    const targetPath = path.join('data/', file + '.json')
    const additionalDataFilePath = path.join('../data/', file + '.additional.json')

    const fileBuffer = fs.readFileSync(path.join('../data/', file + '.json'))
    let fileContent = JSON.parse(fileBuffer.toString())
    if (fs.existsSync(additionalDataFilePath)) {
        const additionalBuffer = fs.readFileSync(additionalDataFilePath)
        const additionalContent = JSON.parse(additionalBuffer.toString())
        fileContent = deepmerge(fileContent, additionalContent)
    }
    if (file === 'cards_ja') {
        // Merge Paralle cards with original entry
        const fileContentReduced = {...fileContent}
        for (const key in fileContentReduced) {
            fileContentReduced[key].parallels = []
            if (!key.startsWith('B')) {
                continue;
            }
            let regularKey = ''
            if (key.endsWith('P')) { // regular parallel
                regularKey = key.replace(/P$/, '')
            }
            if (key.endsWith('Sec2')) { // regular parallel
                regularKey = key.replace(/Sec2$/, 'Sec1')
            }
            if (!regularKey) {
                continue;
            }
            fileContentReduced[regularKey].parallels.push(key)
            delete fileContentReduced[key]
        }
        const reducedTargetPath = path.join('data/', file + '_reduced.json')
        fs.writeFileSync(reducedTargetPath, JSON.stringify(fileContentReduced))
    }
    if (file === 'products_ja') {
        fileContent = Object.fromEntries(
            Object.entries(fileContent).sort(([k1], [k2]) => k1 < k2 ? -1 : 1),
        )
        // remove promo cards as they are searchable by filtering for PR
        delete fileContent["products.PRカード"]
    } else if (file === 'types_ja') {
        delete fileContent['types.null']
    }
    fs.writeFileSync(targetPath, JSON.stringify(fileContent))
}