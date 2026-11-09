import {CardList} from "../card-list";

export class Group<T = string | number> {
    public name: string;
    public value: T;
    public icon: string;
    public color: string[];

    public cards: CardList;
    public groups: Group<T>[];

    constructor(group: Partial<Group<T>>) {
        Object.assign(this, group);
    }

    count(): number {
        let count = this.cards?.count() ?? 0;
        this.groups?.forEach(group => count += group.count());
        return count;
    }
}
