import {SVG} from "./xml";

export function skeleton(name?: string): SVGSVGElement {
    return SVG.svg({
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 25 35',
    }, [
        SVG.rect({x: 0, y: 0, width: 25, height: 35, fill: '#000000'}),
        SVG.rect({x: 2, y: 2, width: 21, height: 31, fill: '#1f1f1f'}),
        SVG.g({fill: '#3f3f3f', stroke: '#000000', stroke_width: 1}, [
            SVG.rect({x: 0.5, y: 0.5, width: 24, height: 3, rx: 1.5}),
            SVG.rect({x: 0.5, y: 19.5, width: 24, height: 3, rx: 1.5}),
            SVG.rect({x: 18.5, y: 31.5, width: 6, height: 3, rx: 1.5}),
        ]),
        name && SVG.text({x: 2, y: 2.5, font_size: 1.5, font_family: 'monospace', fill: '#ffffff'}, name.length > 24
            ? name.slice(0, 21) + '...'
            : name),
    ])
}

export function skeleton_back(): SVGSVGElement {
    return SVG.svg({
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 25 35',
    }, [
        SVG.rect({x: 0, y: 0, width: 25, height: 35, fill: '#000000'}),
        SVG.rect({x: 2, y: 2, width: 21, height: 31, fill: '#0000001f'}),
    ])
}

export function data_url(svg: SVGSVGElement): string {
    return `data:image/svg+xml;utf8,${
        encodeURIComponent(svg.outerHTML)
            .replaceAll(/[()"']/g, s => '%' + s.charCodeAt(0).toString(16))
    }`;
}
