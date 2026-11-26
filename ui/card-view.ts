import {HTML} from "./xml";
import {DeckCard} from "../deck-card";
import {data_url, skeleton, skeleton_back} from "./skeleton";
import {DeckView} from "./deck/deck-view";
import {CardPanel} from "./deck/card-panel";
import {Language} from "../designation/language";
import {Dragger} from "./dragger";

export type CardViewOptions = {
    location?: 'deck' | 'search' | 'panel' | 'dragger';
    face_id?: number;
    is_duplicate?: boolean;
    on_click?: () => any;
    on_drag?: () => any;
    in_deck_view?: boolean;
};

export class CardView {

    static render(
        card: DeckCard,
        id: number | string = null,
        options: CardViewOptions = {},
    ): HTMLDivElement {
        const {
            location,
            face_id = card.display_face_id,
            is_duplicate = false,
            on_click = null,
            on_drag = null,
        } = options;

        const card_class: Set<string> = new Set(['card', 'fade-in']);

        if (Dragger.dragging
            && Dragger.card === card
            && Dragger.dragging.id !== id
        ) {
            card_class.add('dragged');
        }

        if (location === 'deck') {
            if (is_duplicate) card_class.add('duplicate');
            if (card.quantity < 1) card_class.add('ghost');
            if (DeckView.errors.some(error => error.cards?.includes(card))) card_class.add('error');
            if (card === CardPanel.SELECTED) card_class.add('select');
        }

        const faces: HTMLDivElement[] = [];
        const face_shadows: HTMLDivElement[] = [];

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
                    face_shadows[0] = HTML.div({
                        id: `${id}-face-0-shadow`,
                        class: ['face-shadow', 'aftermath', `face-${face_id ?? 'all'}`],
                        style: null,
                    });
                } else {
                    card_class.add('landscape');
                    if (card.card.card_faces.length === 2) {
                        face_shadows[0] = HTML.div({
                            id: `${id}-face-0-shadow`,
                            class: ['face-shadow', 'split', `face-${face_id ?? 'all'}`],
                            style: null,
                        });
                    }
                }
                break;

            case 'flip':
                card_class.add('flip');
                if (face_id === 1) card_class.add('invert');
                face_shadows[0] = HTML.div({
                    id: `${id}-face-0-shadow`,
                    class: ['face-shadow', 'flip', `face-${face_id ?? 'all'}`],
                    style: null,
                });
                break;

            case 'adventure':
                face_shadows[0] = HTML.div({
                    id: `${id}-face-0-shadow`,
                    class: ['face-shadow', 'adventure', `face-${face_id ?? 'all'}`],
                    style: null,
                });
                break;

            case 'prepare':
                face_shadows[0] = HTML.div({
                    id: `${id}-face-0-shadow`,
                    class: ['face-shadow', 'prepare', `face-${face_id ?? 'all'}`],
                    style: null,
                });
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

        let faces_style: object = {};
        let face_style: object[] = [];

        switch (card.card?.id) {
            // Hawkins National Laboratory // The Upside Down
            case '83a86763-c3fe-4cff-8b65-22cb329d112c':
                faces_style['--transform-initial'] = 'rotateX(0deg)';
                faces_style['--transform-final'] = 'rotateX(180deg)';
                face_style[1] = {
                '--specular-x': 'calc(50% - var(--cursor-x) * 1px)',
                '--specular-y': 'calc(50% - var(--cursor-y) * 1px)',
                };
                break;

            // Mind Flayer, the Shadow
            case '0fbaa2f0-9ad0-4ce2-8ce6-359d01bd524c':
                card_class.add('flip');
                card_class.add('invert');
                break;
        }

        switch (card.card?.oracle_id) {
            // Topsy Turvy
            case '4516f30c-fb21-4371-818f-7dd211612a72':
                card_class.add('flip');
                card_class.add('invert');
                break;

            // Curse of the Fire Penguin // Curse of the Fire Penguin Creature
            case '8d8b9933-d7a2-4adc-85ee-ac62b23e784f':
                face_shadows[0] = HTML.div({
                    id: `${id}-face-0-shadow`,
                    class: ['face-shadow', `face-${face_id ?? 'all'}`],
                    style: {
                        background_image: `linear-gradient(
                            to bottom,
                            white calc(23 * var(--card-scale)),
                            black calc(24 * var(--card-scale))
                        )`,
                    },
                });
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
            const face_class: Set<string> = new Set();
            if (face_id === 0 || card.is_double_faced()) {
                const face = card.faces()[face_id];
                urls.push(...face.image_urls());

                let name: string = card.is_double_faced()
                    && face.card_name()
                    || card.card_name();
                if (card.set && card.collector_number) {
                    name ||= `[${card.set.toUpperCase()}:${card.collector_number}]`;
                }
                if (Language.detect_font(name)) {
                    name = null;
                }
                urls.push(data_url(skeleton(name)));
                if (!card.finish.is_default()) {
                    face_class.add(card.finish.name.toLowerCase());
                }
            } else if (card.has_alternative_back()) {
                const back_url = card.back_image_url();
                if (back_url) {
                    card_class.add('transform');
                    urls.push(card.back_image_url());
                    urls.push(data_url(skeleton_back()));
                }
            }

            faces.push(HTML.div({
                id: `${id}-face-${face_id}`,
                class: [
                    'card-face',
                    ['front', 'back'][face_id],
                    ...face_class,
                ],
                style: {
                    background_image: urls
                        .map(url => `url(${url})`)
                        .join(', '),
                    ...face_style[face_id] ?? {},
                },
            }, face_shadows[face_id]));
        });

        let tilt: HTMLDivElement = null;
        let remove_timeout: number = null;
        return HTML.div(
            {
                id,
                class: [...card_class],
                onpointerdown: on_drag && (card_view => Dragger.grab(card, card_view, location)),
                onpointermove: (card_view, {x, y}) => {
                    const {top, left, width, height} = card_view.getBoundingClientRect();
                    const effective_height = height
                        + Number.parseFloat(getComputedStyle(card_view).marginBottom);
                    const dx = x - (left) - width / 2;
                    const dy = y - top - effective_height / 2;

                    tilt.style.setProperty('--cursor-x', `${dx}`);
                    tilt.style.setProperty('--cursor-y', `${dy}`);
                },
                onpointerenter: location === 'deck' && (() => DeckView.focus(card)),
                onpointerleave: location === 'deck' && (() => DeckView.unfocus(card)),
                onclick: on_click && ((_, event) => {
                    event.stopPropagation();
                    on_click();
                }),
                onremove: card_view => {
                    card_view.classList.add('fade-out');
                    remove_timeout = setTimeout(() => card_view.remove(), 200);
                },
                onrefresh: card_view => {
                    card_view.classList.remove('fade-out');
                    clearTimeout(remove_timeout);
                },
            },
            HTML.div({class: 'trigger'}),
            HTML.div(
                {
                    id: id && `${id}-shift`,
                    class: 'card-shift',
                },
                ['deck', 'dragger'].includes(location) && !is_duplicate
                    && HTML.div({class: 'count'}, `${card.quantity}×`),
                tilt = HTML.div(
                    {
                        id: id && `${id}-tilt`,
                        class: 'card-tilt',
                    },
                    HTML.div({
                        id: id && `${id}-faces`,
                        class: 'card-faces',
                        style: faces_style,
                    }, faces),
                ),
            ),
        );
    }
}
