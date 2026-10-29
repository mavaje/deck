
export type Color = 'W' | 'U' | 'B' | 'R' | 'G';
export type ProducedColor = 'C' | Color;

export const COLORS: Color[] = ['W', 'U', 'B', 'R', 'G'];

export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus';

export type Legality = 'legal' | 'not_legal' | 'restricted' | 'banned';

export type Finish = 'foil' | 'nonfoil' | 'etched';

export type SecurityStamp = 'oval' | 'triangle' | 'acorn' | 'circle' | 'arena' | 'heart';

export type Component = 'token' | 'meld_part' | 'meld_result' | 'combo_piece';

export interface SFObject<T extends string = string> {
    object: T;
}

export interface Error extends SFObject<'error'> {
    status: number;
    code: string;
    details: string;
    type?: string;
    warnings: string[];
}

export interface Catalog extends SFObject<'catalog'> {
    uri: string;
    total_values: number;
    data: string[];
}

export interface List<O extends SFObject = SFObject> extends SFObject<'list'> {
    data: O[];
    has_more: boolean;
    next_page?: string;
    total_cards?: number;
    warnings?: string[];
    not_found?: Identifier[];
}

export interface Set extends SFObject<'set'> {
    id: string;
    code: string;
    mtgo_code?: string;
    arena_code?: string;
    tcgplayer_id?: string;
    name: string;
    set_type: string;
    released_at?: string;
    block_code?: string;
    block?: string;
    parent_set_code?: string;
    card_count: number;
    printed_size?: number;
    digital: boolean;
    foil_only: boolean;
    nonfoil_only: boolean;
    scryfall_uri: string;
    uri: string;
    icon_svg_uri: string;
    search_uri: string;
}

export interface CardImagery {
    small?: string;
    normal?: string;
    large?: string;
    png?: string;
    art_crop?: string;
    border_crop?: string;
    thumb?: string;
    grid?: string;
    display?: string;
    art?: string;
    crop?: string;
    jpeg?: string;
}

export interface Prices {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
    eur?: string;
    eur_foil?: string;
    eur_etched?: string;
    tix?: string;
}

export interface CardFace extends SFObject<'card_face'> {
    artist?: string;
    artist_id?: string;
    cmc?: number;
    color_indicator?: Color[];
    colors?: Color[];
    defense?: string;
    flavor_text?: string;
    illustration_id?: string;
    image_uris?: CardImagery;
    layout?: string;
    loyalty?: string;
    mana_cost: string;
    name: string;
    flavor_name?: string;
    oracle_id?: string;
    oracle_text?: string;
    power?: string;
    printed_name?: string;
    printed_text?: string;
    printed_type_line?: string;
    toughness?: string;
    type_line?: string;
    watermark?: string;
}

export interface RelatedCard extends SFObject<'related_card'> {
    id: string;
    component: Component;
    name: string;
    type_line: string;
    uri: string;
}

export interface Preview {
    previewed_at: string;
    source_uri: string;
    source: string;
}

export interface Card extends SFObject<'card'> {
    // core card fields
    arena_id?: number;
    id: string;
    lang: string;
    mtgo_id?: number;
    mtgo_foil_id?: number;
    multiverse_ids?: number[];
    resource_id?: string;
    tcgplayer_id?: number;
    tcgplayer_etched_id?: number;
    cardmarket_id?: number;
    layout: string;
    oracle_id?: string;
    prints_search_uri: string;
    rulings_uri: string;
    scryfall_uri: string;
    uri: string;

    // gameplay fields
    all_parts?: RelatedCard[];
    card_faces?: CardFace[];
    cmc?: number;
    color_identity: Color[];
    color_indicator?: Color[];
    colors?: Color[];
    defense?: string;
    edhrec_rank?: number;
    game_changer?: boolean;
    hand_modifier?: string;
    keywords: string[];
    legalities: Record<string, Legality>;
    life_modifier?: string;
    loyalty?: string;
    mana_cost?: string;
    name: string;
    oracle_text?: string;
    penny_rank?: number;
    power?: string;
    produced_mana?: ProducedColor[];
    reserved: boolean;
    toughness?: string;
    type_line?: string;

    // print fields
    artist?: string;
    artist_ids?: string[];
    attraction_lights?: number[];
    booster: boolean;
    border_color: string;
    card_back_id?: string;
    collector_number: string;
    content_warning?: boolean;
    digital: boolean;
    foil?: boolean;
    nonfoil?: boolean;
    finishes: Finish[];
    flavor_name?: string;
    flavor_text?: string;
    frame_effects?: string[];
    frame: string;
    full_art: boolean;
    games: string[];
    highres_image: boolean;
    illustration_id?: string;
    image_status: string;
    image_updated_at: string;
    image_uris?: CardImagery;
    oversized: boolean;
    prices: Prices;
    printed_name?: string;
    printed_text?: string;
    printed_type_line?: string;
    promo: boolean;
    promo_types?: string[];
    purchase_uris: Record<string, string>;
    rarity: Rarity;
    related_uris: Record<string, string>;
    released_at: string;
    reprint: boolean;
    scryfall_set_uri: string;
    set_name: string;
    set_search_uri: string;
    set_type: string;
    set_uri: string;
    set: string;
    set_id: string;
    story_spotlight: boolean;
    textless: boolean;
    variation: boolean;
    variation_of?: string;
    security_stamp?: SecurityStamp;
    watermark?: string;
    preview?: Preview;
}

export type Identifier = {
    id: string;
} | {
    mtgo_id: number | string;
} | {
    multiverse_id: number | string;
} | {
    oracle_id: string;
} | {
    illustration_id: string;
} | {
    name: string;
    set?: string;
} | {
    set: string;
    collector_number: number | string;
};
