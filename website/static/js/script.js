window.DCTCardOverlays = {}

class Card extends HTMLElement {
    data = {
        id: '',
        type: '',
        cardNum: '',
        title: '',
        product: '',
        color: '',
        rarity: '',
        categories: [],
        cost: 0,
        ap: 0,
        lp: 0,
        illustrator: '',
    }

    // The browser calls this method when the element is
    // added to the DOM.
    connectedCallback() {
        this.data.id = this.getAttribute('id')
        this.data.type = this.getAttribute('type')
        this.data.cardNum = this.getAttribute('card-num')
        this.data.title = this.getAttribute('title')
        this.data.product = this.getAttribute('product')
        this.data.color = this.getAttribute('color')
        this.data.rarity = this.getAttribute('rarity')
        this.data.categories = this.getAttribute('categories').split(',')
        this.data.cost = this.getAttribute('cost')
        this.data.ap = this.getAttribute('ap')
        this.data.lp = this.getAttribute('lp')
        this.data.image = this.getAttribute('image')
        this.data.illustrator = this.getAttribute('illustrator') || ''
        this.data.feature = this.hasAttribute('feature') && this.getAttribute('feature').length ? this.getAttribute('feature') : '–'

        // Prepare filter attributes
        const ignoreFilterAttributes = ['image']
        for (let setting of Object.keys(this.data)) {
            if (ignoreFilterAttributes.includes(setting)) {
                continue
            }
            let value = this.data[setting]
            if (['feature', 'illustrator'].includes(setting) && ['', '-'].includes(value)) {
                value = null
            }
            if (setting === 'categories') {
                value = value.join(',')
            }
            if (setting === 'cardNum') {
                setting = 'card-num'
            }
            if (!value) {
                continue
            }
            this.setAttribute('data-filter-' + setting, value)
            this.removeAttribute(setting)
        }

        this.prepareOverlays()
        this.render()
    }

    render() {
        //const shadow = this.attachShadow({mode: "open"});
        //const wrapper = document.createElement('div')
        const img = document.createElement('img')
        const popoverId = `card-${this.data.id}`
        //img.setAttribute('data-filter-name', this.data.title)
        //img.setAttribute('data-filter-color', this.data.color)
        //img.setAttribute('data-filter-product', this.data.product)
        //img.setAttribute('data-filter-rarity', this.data.rarity)
        //img.setAttribute('data-filter-cost', this.data.cost)
        //img.setAttribute('data-filter-ap', this.data.ap)
        //img.setAttribute('data-filter-lp', this.data.lp)
        //img.setAttribute('data-filter-categories', this.data.categories.join(','))
        //img.setAttribute('data-filter-type', this.data.type)
        img.src = this.data.image
        img.classList.add('cursor-pointer')
        img.width = 160
        img.alt = `${this.data.title} (${this.data.cardNum})`
        this.appendChild(img)
        //shadow.appendChild(wrapper)

        const overlaySelector = '#DCT-Overlays #' + popoverId
        const popover = new Popover(
            document.querySelector(overlaySelector),
            img,
            {
                placement: this.getAttribute('popover-placement'),
                triggerType: 'click'
            }
        )
        img.addEventListener('click', () => {
            // need to reinitialize with overlay element once
            popover._targetEl = document.querySelector(overlaySelector)
            popover._initialized = false
            popover.init()
            popover.show()
        }, {once: true})
    }

    prepareOverlays() {
        if (!document.getElementById('DCT-Overlays')) {
            const container = document.createElement('div')
            container.id = 'DCT-Overlays'
            document.querySelector('#content').parentElement.appendChild(container)
        }
        const container = document.getElementById('DCT-Overlays')

        const labels = {
            cardNum: 'Card ID',
            type: 'Card Category',
            feature: 'Effect',
            product: 'Product',
            color: 'Color',
            rarity: 'Rarity',
            categories: 'Categories',
            cost: 'Cost',
            ap: 'AP',
            lp: 'LP',
            illustrator: 'Illustrator'
        }

        const fields = ['cardNum', 'type']
        if (this.data.type !== 'Case') {
            fields.push('feature')
        }
        fields.push('product')
        fields.push('color')
        fields.push('rarity')
        if (this.data.type === 'Character') {
            fields.push('categories')
        }
        if (this.data.type === 'Character' || this.data.type === 'Event') {
            fields.push('cost')
        }
        if (this.data.type === 'Character') {
            fields.push('ap')
        }
        if (this.data.type === 'Character' || this.data.type === 'Partner') {
            fields.push('lp')
        }
        if (this.data.illustrator.length) {
            fields.push('illustrator')
        }

        let content = ''
        for (const key of fields) {
            let value = this.data[key]
            if (key === 'categories') {
                value = value.join(', ')
            }
            if (key === 'feature') {
                value = value.replaceAll('\n', '<br>')
            }
            content += `<div class="flex justify-between">
                    <div class="text-start font-bold">${labels[key]}</div>
                    <div class="text-end card_details--${key}">${value}</div>
                </div>`;
        }

        container.innerHTML += `<div data-popover id="card-${this.data.id}" role="tooltip"
     class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800"
>
    <div class="flex">
        <img src="${this.data.image}" alt="${this.data.title} (${this.data.cardNum})" style="max-width: unset;">
        <div style="min-width: 450px;" class="bg-white dark:bg-warmgray-800 dark:text-white">
            <div class="px-2 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700 flex justify-between">
                <h3 class="font-semibold text-gray-900 dark:text-white text-lg">${this.data.title}</h3>
                <button onclick="FlowbiteInstances.getInstance('Popover', 'card-${this.data.id}').hide()">x</button>
            </div>
            <div class="px-2 py-2">
                ${content}
            </div>
        </div>
    </div>
    <div data-popper-arrow></div>
</div>`
    }
}

// Register the CurrentDate component using the tag name <current-date>.
customElements.define('dct-card', Card);