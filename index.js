import ts from "typescript";
import { readFileSync } from "fs";
import path from "path";

const fileName = 'FormCheckboxTree.ts';


const sourceFile = ts.createSourceFile(
    fileName,
    readFileSync(fileName).toString(),
    ts.ScriptTarget.ES2015,
    true
);

const classComponent = getClassComponent();

function getComponentDecoratorProperties() {
    return classComponent.decorators[0].expression.arguments[0].properties;
}

function getClassComponent() {
    let classComponent = null;

    ts.forEachChild(sourceFile, (node) => {
        if(ts.isClassDeclaration(node)) {
            classComponent = node;
        }
    })

    return classComponent;
}


function getComponentProps() {
    const properties = [];

    ts.forEachChild(classComponent, (node) => {
        if(ts.isPropertyDeclaration(node) && node.decorators?.[0]?.expression.expression.escapedText === 'Prop') {
            const props = node.decorators[0].expression.arguments[0].properties;

            const obj = ts.factory.createPropertyAssignment(
                node.name,
                ts.factory.createObjectLiteralExpression(props, true)
            );

            properties.push(obj);
        }
    })

    return properties;
}



function getMethod(name, block) {
    const statements = [];

    return ts.factory.createMethodDeclaration(
        undefined,
        undefined,
        undefined,
        name,
        undefined,
        undefined,
        undefined,
        undefined,
        ts.factory.createBlock(statements, true),
    );
}

function getObject(name) {
    const statements = [];

    return ts.factory.createObjectLiteralExpression([]);
}


function getComponentMethods() {
    const methods = []

    ts.forEachChild(classComponent, (node) => {
        if (ts.isMethodDeclaration(node) && !node.decorators) {
            node.modifiers = undefined;
            methods.push(node);
        }
    });

    return methods;
}

function getClassComputed() {
    const computeds = []
    const map = {};

    ts.forEachChild(classComponent, (node) => {
        if (ts.isGetAccessor(node) || ts.isSetAccessor(node)) {
            if (!(node.name.escapedText in map)) {
                map[node.name.escapedText] = {};
            }

            if (ts.isSetAccessor(node)) {
                map[node.name.escapedText]['set'] = node;
            } else if (ts.isGetAccessor(node)) {
                map[node.name.escapedText]['get'] = node;
            }
        }
    });

    for (const [name, acessors] of Object.entries(map) ) {
        if ('set' in acessors) {
            Object.values(acessors).forEach(acessor => {
                acessor.modifiers = undefined;
            })

            const obj = ts.factory.createPropertyAssignment(
                name,
                ts.factory.createObjectLiteralExpression(Object.values(acessors), true)
            );
            computeds.push(obj);
        } else if ('get' in acessors) {
            const obj = ts.factory.createMethodDeclaration(
                undefined,
                undefined,
                undefined,
                name,
                undefined,
                acessors.get.typeParameters,
                acessors.get.parameters,
                acessors.get.type,
                ts.factory.createBlock(acessors.get.body.statements, true),
            );

            computeds.push(obj);
        }
    }


    return computeds;
}

function getComponentNameProperty() {
    const componentName = path.parse(fileName).name;
    return ts.factory.createPropertyAssignment('name', ts.factory.createIdentifier(componentName));
}


function createVueExtendExpression() {
    const objectLiteral = ts.factory.createObjectLiteralExpression([
        getComponentNameProperty(),
        ...getComponentDecoratorProperties(),
        ts.factory.createPropertyAssignment('methods', ts.factory.createObjectLiteralExpression(
            getComponentMethods(), true
        )),
        ts.factory.createPropertyAssignment('props', ts.factory.createObjectLiteralExpression(
            getComponentProps(), true
        )),
        ts.factory.createPropertyAssignment('computed', ts.factory.createObjectLiteralExpression(
            getClassComputed(), true
        )),


    ], true);

    return ts.factory.createCallExpression(
        ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier("Vue"), "extend"),
        undefined,
        [objectLiteral]
    );
}

const resultFile = ts.createSourceFile("someFileName.ts", "", ts.ScriptTarget.Latest, /*setParentNodes*/ false, ts.ScriptKind.TS);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

const result = printer.printNode(ts.EmitHint.Unspecified, createVueExtendExpression(), resultFile);

console.log(result);