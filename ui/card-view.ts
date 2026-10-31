import {HTML} from "../html";
import {DeckCard} from "../deck-card";
import {normalise_set} from "../text";

export class CardView {

    static render(
        card: DeckCard,
        is_collapsed: boolean = false,
    ): HTMLDivElement {
        let show_back = true;
        const card_class: string[] = ['card'];
        const faces: HTMLDivElement[] = [];

        const add_face = (urls: string[], is_back: boolean = false): void => {
            urls.push('/public/skeleton-card.svg');
            faces.push(HTML.div({
                class: is_back ? ['card-face', 'back'] : 'card-face',
                style: {
                    background_image: urls
                        .map(url => `url(${url})`)
                        .join(', '),
                },
            }));
        };

        add_face(card.image_urls());

        switch (card.layout()) {
            case 'transform':
            case 'modal_dfc':
            case 'double_faced_token':
            case 'reversible_card':
            case 'art_series':
                show_back = false;
                card_class.push('transform');
                add_face(card.image_urls(1), true);
                break;

            case 'split':
                if (card.has_keyword('Aftermath')) {
                    show_back = false;
                    card_class.push('aftermath');
                } else {
                    card_class.push('landscape');
                }
                break;

            case 'flip':
                show_back = false;
                card_class.push('flip');
                break;

            case 'meld':
                const parts = card.card.all_parts;
                const my_part = parts.find(part => part.name === card.card.name);
                if (my_part?.component === 'meld_result') {
                    card_class.push('double');
                }
                break;

            case 'scheme':
            case 'vanguard':
                card_class.push('double');
                break;

            case 'planar':
                card_class.push('double', 'landscape');
                break;
        }

        if (card.is_type('Battle')) {
            card_class.push('landscape-front');
        }

        let faces_style = {};

        switch (card.card?.id) {
            // Hawkins National Laboratory // The Upside Down
            case '83a86763-c3fe-4cff-8b65-22cb329d112c':
                faces_style['--transform-initial'] = 'rotateX(0deg)';
                faces_style['--transform-final'] = 'rotateX(180deg)';
        }

        switch (card.card?.oracle_id) {
            // Topsy Turvy
            case '4516f30c-fb21-4371-818f-7dd211612a72':
                show_back = false;
                card_class.push('flip');
                break;

            // Burning Cinder Fury of Crimson Chaos Fire
            case '9716976e-1b52-4351-932e-b99fe206afbd':
                card_class.push('landscape');
                break;

            // Who // What // When // Where // Why
            case 'adfe1b07-dd82-4c39-a7a6-ded0b1c39761':
                card_class[1] = 'landscape-front';
                faces_style['transition-duration'] = '0.25s';
                faces_style['transform-origin'] = 'calc(var(--card-width) / 2) 50%';
                faces_style['--transform-initial'] = 'rotateZ(90deg)';
                faces_style['--transform-final'] = 'rotateZ(0deg)';
                break;
        }

        if (!card.finish.is_default()) {
            faces.forEach(face => {
                face.classList.add('foil');
            })
        }

        if (show_back && card.has_different_back()) {
            const id = card.back_id();
            card_class.push('transform');
            add_face([`https://backs.scryfall.io/large/${id[0]}/${id[1]}/${id}.jpg`], true);
        }

        let card_view: HTMLDivElement = null;
        let tilt: HTMLDivElement = null;
        return card_view = HTML.div(
            {
                // id,
                class: card_class,
                onpointermove: ({x, y}: MouseEvent) => {
                    const {top, left, width, height} = card_view.getBoundingClientRect();
                    const effective_height = is_collapsed
                        ? card_view.children[0].getBoundingClientRect().height
                        : height;
                    const dx = x - (left + 24) - width / 2;
                    const dy = y - top - effective_height / 2;
                    const angle = Math.atan2(dy, dx);
                    const azimuth = -10 * Math.min(Math.hypot(dx, dy) / 100, 1);
                    tilt.style.setProperty('--tilt-angle', `${angle}rad`);
                    tilt.style.setProperty('--tilt-azimuth', `${azimuth}deg`);
                },
                onpointerleave: () => {
                    tilt.style.setProperty('--tilt-angle', `0`);
                    tilt.style.setProperty('--tilt-azimuth', `0`);
                },
                onclick: () => {
                    console.log(`clicked ${this.name}`);
                    console.log([
                        normalise_set(card.card?.set ?? card.set, true) ?? '_',
                        card.card?.collector_number ?? card.collector_number,
                    ].join('-'));
                },
            },
            HTML.div({class: 'backdrop'}),
            HTML.div({class: 'trigger'}),
            HTML.div(
                {class: 'card-shift'},
                HTML.div({class: 'count'}, `${card.quantity}×`),
                tilt = HTML.div(
                    {class: 'card-tilt'},
                    HTML.div({class: 'card-faces', style: faces_style}, faces),
                ),
            ),
        );
    }
}
