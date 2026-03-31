export class Transform {
    constructor() {
        throw new Error("Can't instantiate Transform. Use its static methods.");
    }

    static translate(element, x, y) {
        const transformList = element.transform.baseVal;
        const transform = element.ownerSVGElement.createSVGTransform();

        transform.setTranslate(x, y);
        transformList.appendItem(transform);
    }
    
    // No origin assumes center of the element
    static rotate(element, angle, origin) {
        const transformList = element.transform.baseVal;

        const transform = element.ownerSVGElement.createSVGTransform();
        
        if (!origin) {
            const bbox = element.getBBox();

            origin = {
                x: bbox.x + (bbox.width / 2),
                y: bbox.y + (bbox.height / 2)
            };
        }

        transform.setRotate(angle, origin.x, origin.y);
        transformList.appendItem(transform);
    }

    static scale(element, x, y) {
        const transformList = element.transform.baseVal;

        let matrix = new DOMMatrix();;
        matrix = matrix.scaleSelf(x, y);
        
        const transform = transformList.createSVGTransformFromMatrix(matrix);
        transformList.appendItem(transform);
    }

    static clear(element) {
        const transformList = element.transform.baseVal;
        transformList.clear();
    }

    static scaleCenter(element, x, y) {
        const transformList = element.transform.baseVal;

        const bbox = element.getBBox();

        const centerPoint = {
            x: bbox.x + (bbox.width / 2),
            y: bbox.y + (bbox.height / 2)
        };

        let matrix = new DOMMatrix();
        matrix = matrix.translateSelf(centerPoint.x, centerPoint.y);
        matrix = matrix.scaleSelf(x, y);
        matrix = matrix.translateSelf(-centerPoint.x , -centerPoint.y);
        
        const transform = transformList.createSVGTransformFromMatrix(matrix);
        transformList.appendItem(transform);
    }

    static center(element, baseSize) {
        const bbox = element.getBBox();

        const centerPoint = {
            x: bbox.x + (bbox.width / 2),
            y: bbox.y + (bbox.height / 2),
        }

        Transform.translate(element, baseSize.width / 2 - centerPoint.x, baseSize.height / 2 - centerPoint.y);
    }
}