import {HTML} from "./xml";
import {DeckCard} from "../deck-card";
import {data_url, skeleton, skeleton_back} from "./skeleton";
import {edit_card_modal} from "./modal/card-edit-modal";

export class CardView {

    static renderings = new WeakMap<DeckCard, HTMLDivElement[]>();

    static render(
        card: DeckCard,
        id: number | string,
        last_in_card: boolean = false,
        last_in_stack: boolean = false,
        face_id: number = card.display_face_id,
    ): HTMLDivElement {
        const card_class: Set<string> = new Set(['card']);
        if (!last_in_card) card_class.add('collapsible');
        if (card.quantity < 1) card_class.add('ghost');

        const faces: HTMLDivElement[] = [];

        switch (card.layout()) {
            case 'transform':
            case 'modal_dfc':
            case 'double_faced_token':
            case 'reversible_card':
            case 'art_series':
                card_class.add('transform');
                if (face_id === 1) card_class.add('invert');
                break;

            case 'split':
                if (card.has_keyword('Aftermath')) {
                    card_class.add('aftermath');
                    if (face_id === 1) card_class.add('invert');
                } else {
                    card_class.add('landscape');
                }
                break;

            case 'flip':
                card_class.add('flip');
                if (face_id === 1) card_class.add('invert');
                break;

            case 'meld':
                const parts = card.card.all_parts;
                const my_part = parts.find(part => part.name === card.card.name);
                if (my_part?.component === 'meld_result') {
                    card_class.add('double');
                }
                break;

            case 'scheme':
            case 'vanguard':
                card_class.add('double');
                break;

            case 'planar':
                card_class.add('double');
                card_class.add('landscape');
                break;
        }

        if (card.is_type('Battle')) {
            card_class.add('landscape-front');
        }

        let faces_style = {};

        switch (card.card?.id) {
            // Hawkins National Laboratory // The Upside Down
            case '83a86763-c3fe-4cff-8b65-22cb329d112c':
                faces_style['--transform-initial'] = 'rotateX(0deg)';
                faces_style['--transform-final'] = 'rotateX(180deg)';
                break;
        }

        switch (card.card?.oracle_id) {
            // Topsy Turvy
            case '4516f30c-fb21-4371-818f-7dd211612a72':
                card_class.add('flip');
                card_class.add('invert');
                break;

            // Burning Cinder Fury of Crimson Chaos Fire
            case '9716976e-1b52-4351-932e-b99fe206afbd':
                card_class.add('landscape');
                break;

            // Who // What // When // Where // Why
            case 'adfe1b07-dd82-4c39-a7a6-ded0b1c39761':
                card_class.delete('landscape');
                card_class.add('landscape-front');
                if ([2, 3, 4].includes(face_id)) card_class.add('invert');
                faces_style['transform-origin'] = 'calc(var(--card-width) / 2) 50%';
                faces_style['--transform-initial'] = 'rotateZ(90deg)';
                faces_style['--transform-final'] = 'rotateZ(0deg)';
                break;
        }

        if (card.card?.oversized) {
            card_class.add('double');
        }

        [0, 1].forEach(face_id => {
            if (face_id > 0 && !(card.is_double_faced() || card.has_alternative_back())) {
                return;
            }

            const urls: string[] = [];
            if (face_id === 0 || card.is_double_faced()) {
                const face = card.faces()[face_id];
                urls.push(...face.image_urls());

                const name = card.is_double_faced()
                    && face.card_name(true)
                    || card.card_name(true)
                    || `[${card.set.toUpperCase()}:${card.collector_number}]`;
                urls.push(data_url(skeleton(name)));
            } else if (card.has_alternative_back()) {
                const back_url = card.back_image_url();
                if (back_url) {
                    card_class.add('transform');
                    urls.push(card.back_image_url());
                    urls.push(data_url(skeleton_back()));
                }
            }

            faces.push(HTML.div({
                id: `${id}-face-${faces.length}`,
                class: [
                    'card-face',
                    ['front', 'back'][face_id],
                    !card.finish.is_default() && 'foil',
                ],
                style: {
                    background_image: urls
                        .map(url => `url(${url})`)
                        .join(', '),
                },
            }));
        });

        let tilt: HTMLDivElement = null;
        const elements = CardView.renderings.get(card) ?? [];
        const card_view = HTML.div(
            {
                id,
                class: [...card_class],
                onpointermove: (_, {x, y}) => {
                    const {top, left, width, height} = card_view.getBoundingClientRect();
                    const effective_height = last_in_stack
                        ? height
                        : card_view.children[0].getBoundingClientRect().height;
                    const dx = x - (left + 24) - width / 2;
                    const dy = y - top - effective_height / 2;
                    const angle = Math.atan2(dy, dx);
                    const azimuth = -10 * Math.min(Math.hypot(dx, dy) / 100, 1);
                    tilt.style.setProperty('--tilt-angle', `${angle}rad`);
                    tilt.style.setProperty('--tilt-azimuth', `${azimuth}deg`);
                },
                onpointerenter: () => {
                    CardView.renderings.get(card)
                        ?.forEach(element => element.classList.add('focus'));
                },
                onpointerleave: () => {
                    CardView.renderings.get(card)
                        ?.forEach(element => element.classList.remove('focus'));
                    tilt.style.setProperty('--tilt-angle', `0`);
                    tilt.style.setProperty('--tilt-azimuth', `0`);
                },
                onclick: () => edit_card_modal(card),
            },
            HTML.div({class: 'backdrop'}),
            HTML.div({class: 'trigger'}),
            HTML.div(
                {
                    id: `${id}-shift`,
                    class: 'card-shift',
                },
                last_in_card && HTML.div({class: 'count'}, `${card.quantity}×`),
                tilt = HTML.div(
                    {
                        id: `${id}-tilt`,
                        class: 'card-tilt',
                    },
                    HTML.div({
                        id: `${id}-faces`,
                        class: 'card-faces',
                        style: faces_style,
                    }, faces),
                ),
            ),
        );
        elements.push(card_view);
        CardView.renderings.set(card, elements);
        return card_view;
    }
}
