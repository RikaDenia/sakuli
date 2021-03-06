import {getPropertyDecoratorDefinitions} from "./properties.decorator";
import {DecoratedTestClass} from "../__mocks__";

describe('Property decorator', () => {


    it('should get defined properties', () => {
        const jpDef = getPropertyDecoratorDefinitions(DecoratedTestClass);
        expect(jpDef.length).toBe(4);
        expect(jpDef).toContainEqual({path: 'my.property.path', property: 'property'});
        expect(jpDef).toContainEqual({path: 'property.2', property: 'property2'});
        expect(jpDef).toContainEqual({path: 'property.alt', property: 'property2'})
    })
});