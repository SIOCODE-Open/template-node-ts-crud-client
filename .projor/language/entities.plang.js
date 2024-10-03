const FLAGS = {
    assumeUserAccountEntity: false,
};


async function parseAllEntitiesFiles(files) {

    const TOP_LEVEL_ELEMENTS = [
        {
            type: "block",
            name: "entity",
            keyword: "entity",
            content: [
                {
                    type: "typed-declaration",
                    name: "attribute",
                    keyword: "col",
                },
                {
                    type: "typed-declaration",
                    name: "association",
                    keyword: "join",
                },
                {
                    type: "typed-declaration",
                    name: "reverse_association",
                    keyword: "reverse join",
                },
            ],
        },
    ];
    
    // Helper functions
    function extractWithinBrackets(text, startIndex, openChar, closeChar) {
        let content = "";
        let bracketCount = 0;
        let foundStart = false;
    
        for (let i = startIndex; i < text.length; i++) {
            let char = text[i];
            if (!foundStart) {
                if (char === openChar) {
                    foundStart = true;
                    bracketCount++;
                }
            } else {
                content += char;
                if (char === openChar) bracketCount++;
                if (char === closeChar) bracketCount--;
                if (bracketCount === 0) {
                    return {
                        content: content.substring(0, content.length - 1).trim(),
                        endIndex: i,
                    };
                }
            }
        }
        return null; // No matching closing bracket found
    }
    
    function extractExpressionDetails(
        inputText,
        currentIndex,
        currentLineEndIndex
    ) {
        let annotation = "";
        let generic = "";
        let arguments = "";
        let nextSquareBracketIndex = inputText.indexOf("[", currentIndex);
        let nextLessThanIndex = inputText.indexOf("<", currentIndex);
        let nextOpenParenthesisIndex = inputText.indexOf("(", currentIndex);
    
        if (
            nextSquareBracketIndex !== -1 &&
            (nextSquareBracketIndex < currentLineEndIndex ||
                currentLineEndIndex === -1) &&
            (nextSquareBracketIndex < nextLessThanIndex ||
                nextLessThanIndex === -1) &&
            (nextSquareBracketIndex < nextOpenParenthesisIndex ||
                nextOpenParenthesisIndex === -1)
        ) {
            const annotationContent = extractWithinBrackets(
                inputText,
                nextSquareBracketIndex,
                "[",
                "]"
            );
            annotation = annotationContent.content;
    
            if (annotation.includes("<")) {
                nextLessThanIndex = inputText.indexOf(
                    "<",
                    annotationContent.endIndex
                );
            }
            if (annotation.includes("(")) {
                nextOpenParenthesisIndex = inputText.indexOf(
                    "(",
                    annotationContent.endIndex
                );
            }
        }
    
        if (
            nextLessThanIndex !== -1 &&
            (nextLessThanIndex < currentLineEndIndex ||
                currentLineEndIndex === -1) &&
            (nextLessThanIndex < nextOpenParenthesisIndex ||
                nextOpenParenthesisIndex === -1)
        ) {
            const genericContent = extractWithinBrackets(
                inputText,
                nextLessThanIndex,
                "<",
                ">"
            );
            generic = genericContent.content;
    
            if (generic.includes("(")) {
                nextOpenParenthesisIndex = inputText.indexOf(
                    "(",
                    genericContent.endIndex
                );
            }
        }
    
        if (
            nextOpenParenthesisIndex !== -1 &&
            (nextOpenParenthesisIndex < currentLineEndIndex ||
                currentLineEndIndex === -1)
        ) {
            const argumentsContent = extractWithinBrackets(
                inputText,
                nextOpenParenthesisIndex,
                "(",
                ")"
            );
            arguments = argumentsContent.content;
        }
    
        return { annotation, generic, arguments };
    }
    
    function parse(inputText, topLevelElements = TOP_LEVEL_ELEMENTS) {
        // There are 4 fundamental structures to parse:
        // type: block
        //   The general syntax of blocks is:
        //     KEYWORD NAME [ ANNOTATION ] < GENERIC > ( ARGUMENTS ) { CONTENT }
        //   KEYWORD is always a single word, or some words. The list of valid keywords is known and fixed.
        //   NAME is a single word, or some words. It may also contain '.', '-', '_' or '#'.
        //   ANNOTATION is part of a block, surrounded by '[' and ']'. It is arbitrary text between the block characters.
        //   GENERIC is part of a block, surrounded by '<' and '>'. It is arbitrary text between the block characters.
        //   ARGUMENTS is part of a block, surrounded by '(' and ')'. It is arbitrary text between the block characters.
        //   CONTENT is part of a block, surrounded by '{' and '}'. It is arbitrary text between the block characters.
        // type: property
        //   The general syntax of properties is:
        //     KEYWORD VALUE
        //   KEYWORD is always a single word, or some words. The list of valid keywords is known and fixed.
        //   VALUE is any text, up to the end of the line.
        // type: typed-declaration
        //   The general syntax of typed-declarations is:
        //     KEYWORD NAME [ ANNOTATION ] < GENERIC > ( ARGUMENTS ) : TYPE POSTKEYWORD POST
        //   KEYWORD is always a single word, or some words. The list of valid keywords is known and fixed.
        //   NAME is a single word, or some words. It may also contain '.', '-', '_' or '#'.
        //   ANNOTATION is part of a typed-declaration, surrounded by '[' and ']'. It is arbitrary text between the block characters.
        //   GENERIC is part of a typed-declaration, surrounded by '<' and '>'. It is arbitrary text between the block characters.
        //   ARGUMENTS is part of a typed-declaration, surrounded by '(' and ')'. It is arbitrary text between the block characters.
        //   TYPE is a single word, or some words. The list of valid types is known and fixed.
        //   POSTKEYWORD is always a single word, or some words. The list of valid keywords is known and fixed.
        //   POST is any text, up to the end of the line.
        // type: declaration
        //   The general syntax of declarations is:
        //     KEYWORD NAME [ ANNOTATION ] < GENERIC > ( ARGUMENTS ) POSTKEYWORD POST
        //   KEYWORD is always a single word, or some words. The list of valid keywords is known and fixed.
        //   NAME is a single word, or some words. It may also contain '.', '-', '_' or '#'.
        //   ANNOTATION is part of a declaration, surrounded by '[' and ']'. It is arbitrary text between the block characters.
        //   GENERIC is part of a declaration, surrounded by '<' and '>'. It is arbitrary text between the block characters.
        //   ARGUMENTS is part of a declaration, surrounded by '(' and ')'. It is arbitrary text between the block characters.
        //   POSTKEYWORD is always a single word, or some words. The list of valid keywords is known and fixed.
        //   POST is any text, up to the end of the line.
        // Comments: Line comments are supported. Any line beginning with '//' is considered a comment. The element starting after one or more comments receives the comment, so it is available for parsing.
    
        // The parser works like this:
        //   We have a comment buffer, which is [] by default.
        //   We have a context (stack), which is created from the top-level elements by default
        //   We are looking for the first line, that matches a regex in the current context
        //   Based on the keyword, we decide on the exact type of structure to parse
        //   In case of blocks ...
        //     We create a new context from the block, and push it to the stack
        //     We parse the annotation (if any) ...
        //       We look for the first '[' character
        //       We start counting '[' and ']' characters, to find the end of the annotation
        //       We set ANNOTATION to the trimmed text between the '[' and ']' characters
        //     We parse the generic (if any) ...
        //       We look for the first '<' character
        //       We start counting '<' and '>' characters, to find the end of the generic
        //       We set GENERIC to the trimmed text between the '<' and '>' characters
        //     We parse the arguments (if any) ...
        //       We look for the first '(' character
        //       We start counting '(' and ')' characters, to find the end of the arguments
        //       We set ARGUMENTS to the trimmed text between the '(' and ')' characters
        //     We parse the content (if any) ...
        //       We look for the first '{' character
        //       We start counting '{' and '}' characters, to find the end of the content
        //       We set CONTENT to the trimmed text between the '{' and '}' characters
        //     We pop the context from the stack
        //   In case of properties ...
        //     We parse the value ...
        //       We set VALUE to the trimmed text after the keyword
        //   In case of typed-declarations ...
        //     We parse the annotation (if any) ...
        //       We look for the first '[' character
        //       We start counting '[' and ']' characters, to find the end of the annotation
        //       We set ANNOTATION to the trimmed text between the '[' and ']' characters
        //     We parse the generic (if any) ...
        //       We look for the first '<' character
        //       We start counting '<' and '>' characters, to find the end of the generic
        //       We set GENERIC to the trimmed text between the '<' and '>' characters
        //     We parse the arguments (if any) ...
        //       We look for the first '(' character
        //       We start counting '(' and ')' characters, to find the end of the arguments
        //       We set ARGUMENTS to the trimmed text between the '(' and ')' characters
        //     We parse the type, postkeyword and post parts using a regex
        //   In case of declarations ...
        //     We parse the annotation (if any) ...
        //       We look for the first '[' character
        //       We start counting '[' and ']' characters, to find the end of the annotation
        //       We set ANNOTATION to the trimmed text between the '[' and ']' characters
        //     We parse the generic (if any) ...
        //       We look for the first '<' character
        //       We start counting '<' and '>' characters, to find the end of the generic
        //       We set GENERIC to the trimmed text between the '<' and '>' characters
        //     We parse the arguments (if any) ...
        //       We look for the first '(' character
        //       We start counting '(' and ')' characters, to find the end of the arguments
        //       We set ARGUMENTS to the trimmed text between the '(' and ')' characters
        //     We parse the postkeyword and post parts using a regex
        //   In case of comments ...
        //     We add the comment to the comment buffer
        //   In case of empty lines ...
        //     We ignore the line
        //   In case of unknown lines ...
        //     We ignore the line
    
        let currentIndex = 0;
        let commentBuffer = [];
        let results = [];
    
        while (currentIndex < inputText.length) {
            const currentLineEndIndex = inputText.indexOf("\n", currentIndex);
            if (currentIndex === currentLineEndIndex) {
                // Empty line
                currentIndex++;
                commentBuffer = [];
                continue;
            }
            const currentLine = inputText
                .substring(
                    currentIndex,
                    currentLineEndIndex === -1
                        ? inputText.length
                        : currentLineEndIndex
                )
                .trim();
    
            // Check for comments
            if (currentLine.startsWith("//")) {
                commentBuffer.push(currentLine.substring(2).trim());
                // Move to the next line
                currentIndex = currentLineEndIndex + 1;
                continue;
            }
    
            const item = { type: "Unknown" };
    
            // Try to match a top level element
            let matched = false;
    
            for (let topLevelElement of topLevelElements) {
                const isThisElement = new RegExp(
                    `^\\s*${topLevelElement.keyword}\\s*`
                ).test(currentLine);
                if (!matched && isThisElement) {
                    if (topLevelElement.type === "block") {
                        // It is a block
                        // Let's first find where it starts (first '{' character)
                        const blockStartIndex = inputText.indexOf(
                            "{",
                            currentIndex
                        );
                        if (blockStartIndex === -1) {
                            // No block start found
                            break;
                        }
                        const blockContent = extractWithinBrackets(
                            inputText,
                            blockStartIndex,
                            "{",
                            "}"
                        );
    
                        // We should now find the name from the current line
                        const nameMatch = currentLine.match(
                            new RegExp(
                                `\\s*${topLevelElement.keyword}\\s*([a-zA-Z0-9_\\-#\\. /:]+)(?:[\\[\\(<{])`
                            )
                        );
                        const name = nameMatch ? nameMatch[1] : null;
    
                        let { annotation, generic, arguments } =
                            extractExpressionDetails(
                                inputText,
                                currentIndex,
                                currentLineEndIndex
                            );
    
                        // Now we parse the content
                        const parsedBlockContent = parse(
                            blockContent.content,
                            topLevelElement.content || []
                        );
    
                        item.type = topLevelElement.name;
                        item.name = name.trim();
                        item.annotation = annotation.trim();
                        item.generic = generic.trim();
                        item.arguments = arguments.trim();
                        item.content = parsedBlockContent;
    
                        item.comment = commentBuffer.join("\n");
                        commentBuffer = [];
    
                        // Add item to results
                        results.push(item);
                        matched = true;
    
                        // Now we move to the line after the block
                        currentIndex = blockContent.endIndex + 1;
                    } else if (topLevelElement.type === "property") {
                        item.type = topLevelElement.name;
                        item.value = currentLine
                            .substring(topLevelElement.keyword.length)
                            .trim();
    
                        item.comment = commentBuffer.join("\n");
                        commentBuffer = [];
    
                        results.push(item);
                        matched = true;
    
                        // Move to next line
                        if (currentLineEndIndex === -1) {
                            // End of input
                            currentIndex = inputText.length;
                        } else {
                            currentIndex = currentLineEndIndex + 1;
                        }
                    } else if (topLevelElement.type === "declaration") {
                        // We should now find the name from the current line
                        const nameMatch = currentLine.match(
                            new RegExp(
                                `\\s*${topLevelElement.keyword}\\s*([a-zA-Z0-9_\\-#\\. /:]+)(?:[\\[\\(<{])`
                            )
                        );
                        const name = nameMatch ? nameMatch[1] : null;
    
                        let { annotation, generic, arguments } =
                            extractExpressionDetails(
                                inputText,
                                currentIndex,
                                currentLineEndIndex
                            );
    
                        if (topLevelElement.postkeyword) {
                            // See if it has a postkeyword
                            const postkeywordMatch = currentLine.match(
                                new RegExp(`\\s*${topLevelElement.postkeyword}\\s+`)
                            );
                            item.postkeyword = topLevelElement.postkeyword;
                            if (postkeywordMatch) {
                                item.post = currentLine
                                    .substring(
                                        postkeywordMatch.index +
                                            postkeywordMatch[0].length
                                    )
                                    .trim();
                            }
                        }
    
                        item.type = topLevelElement.name;
                        item.name = name.trim();
                        item.annotation = annotation.trim();
                        item.generic = generic.trim();
                        item.arguments = arguments.trim();
    
                        item.comment = commentBuffer.join("\n");
                        commentBuffer = [];
    
                        results.push(item);
                        matched = true;
    
                        // Move to next line
                        if (currentLineEndIndex === -1) {
                            // End of input
                            currentIndex = inputText.length;
                        } else {
                            currentIndex = currentLineEndIndex + 1;
                        }
                    } else if (topLevelElement.type === "typed-declaration") {
                        // We should now find the name from the current line
                        const nameMatch = currentLine.match(
                            new RegExp(
                                `\\s*${topLevelElement.keyword}\\s*([a-zA-Z0-9_\\-#\\. /:]+)(?:[\\[\\(<{])?\\s*:\\s*`
                            )
                        );
                        const name = nameMatch ? nameMatch[1] : null;
    
                        // Now we should find the type declaration
                        const typeMatch = currentLine.match(
                            /\s*:\s*([\w]+)(?:\s+)?/
                        );
                        const type = typeMatch ? typeMatch[1] : null;
    
                        let { annotation, generic, arguments } =
                            extractExpressionDetails(
                                inputText,
                                currentIndex,
                                currentLineEndIndex
                            );
    
                        if (topLevelElement.poskeyword) {
                            // See if it has a postkeyword
                            const postkeywordMatch = currentLine.match(
                                new RegExp(`\\s*${topLevelElement.postkeyword}\\s+`)
                            );
                            item.postkeyword = topLevelElement.postkeyword;
                            if (postkeywordMatch) {
                                item.post = currentLine
                                    .substring(
                                        postkeywordMatch.index +
                                            postkeywordMatch[0].length
                                    )
                                    .trim();
                            }
                        }
    
                        item.type = topLevelElement.name;
                        item.name = name.trim();
                        item.declaredtype = type.trim();
                        item.annotation = annotation.trim();
                        item.generic = generic.trim();
                        item.arguments = arguments.trim();
    
                        item.comment = commentBuffer.join("\n");
                        commentBuffer = [];
    
                        results.push(item);
                        matched = true;
    
                        // Move to next line
                        if (currentLineEndIndex === -1) {
                            // End of input
                            currentIndex = inputText.length;
                        } else {
                            currentIndex = currentLineEndIndex + 1;
                        }
                    } else {
                        item.type = topLevelElement.name;
    
                        item.comment = commentBuffer.join("\n");
                        commentBuffer = [];
    
                        results.push(item);
                        matched = true;
    
                        // Move to next line
                        if (currentLineEndIndex === -1) {
                            // End of input
                            currentIndex = inputText.length;
                        } else {
                            currentIndex = currentLineEndIndex + 1;
                        }
                    }
                }
            }
    
            if (!matched) {
                // Move to next line
                if (currentLineEndIndex === -1) {
                    // End of input
                    currentIndex = inputText.length;
                } else {
                    currentIndex = currentLineEndIndex + 1;
                }
            }
    
            if (currentIndex === -1) {
                // End of input
                break;
            }
        }
    
        return results;
    }

    // Assume the parser function is already here

    function processParsedData(parsedData) {
        const objects = parsedData.map((parsedObject) => {
            const {
                type,
                name,
                content,
                comment
            } = parsedObject;

            if (type !== "entity") {
                return null;
            }

            const baseObject = {
                name,
                description: comment || "No description.",
                attributes: [],
                associations: [],
                reverseAssociations: []
            };

            content.forEach((contentItem) => {
                if (contentItem.type === "attribute") {
                    const newAttr = {
                        name: contentItem.name,
                        type: `basic#${contentItem.declaredtype}`,
                        description: contentItem.comment || "No description.",
                        validation: {
                            name: '_',
                            description: ''
                        }
                    };

                    if (contentItem.arguments) {
                        let remaining = contentItem.arguments || '';
                        // Parse and remove regex first
                        const matchesRe = /(?:matches)\s+(\/(?:(?:[^/\\])+(?:\\\/|\\)?)+\/)/g;
                        const matchesMatch = matchesRe.exec(remaining);
                        if (matchesMatch) {
                            newAttr.validation.matchesRegex = matchesMatch[1]
                                .substring(1, matchesMatch[1].length - 1);
                            const indexOf = remaining.indexOf(matchesMatch[0]);
                            remaining = remaining.substring(0, indexOf) + remaining.substring(indexOf + matchesMatch[0].length);
                        }
                        // // Find all gt, ge, lt, ge
                        const compRe = /([<>]=?)\s+([-]?[\s0-9]+)/;
                        let compMatches = compRe.exec(remaining);
                        while (compMatches) {
                            if (compMatches[1] === '>') {
                                newAttr.validation.isGreaterThan = parseInt(compMatches[2]);
                            } else if (compMatches[1] === '>=') {
                                newAttr.validation.isGreaterThanOrEquals = parseInt(compMatches[2]);
                            } else if (compMatches[1] === '<') {
                                newAttr.validation.isLessThan = parseInt(compMatches[2]);
                            } else if (compMatches[1] === '<=') {
                                newAttr.validation.isLessThanOrEquals = parseInt(compMatches[2]);
                            }

                            const indexOf = remaining.indexOf(compMatches[0]);
                            remaining = remaining.substring(0, indexOf) + remaining.substring(indexOf + compMatches[0].length);
                            compMatches = compRe.exec(remaining);
                        }

                        if (remaining.includes("not null")) {
                            newAttr.validation.isNotNull = true;
                        }
                        if (remaining.includes("not empty")) {
                            newAttr.validation.isNotEmpty = true;
                        }
                        if (remaining.includes("unique")) {
                            newAttr.validation.isUnique = true;
                        }

                    }

                    baseObject.attributes.push(newAttr);
                } else if (contentItem.type === "association") {
                    baseObject.associations.push({
                        name: contentItem.name,
                        type: `entities#${contentItem.declaredtype}`,
                        description: contentItem.comment || "No description.",
                    });
                } else if (contentItem.type === "reverse_association") {
                    baseObject.reverseAssociations.push({
                        name: contentItem.name,
                        type: contentItem.declaredtype === "List"
                            ? `entities#${contentItem.generic}`
                            : `entities#${contentItem.declaredtype}`,
                        description: contentItem.comment || "No description.",
                        isList: contentItem.declaredtype === "List",
                        mappedBy: contentItem.arguments,
                    });
                }
            });

            return baseObject;
        });

        return { id: 'entities', name: 'Entities', schema: 'Entity', objects: objects.filter((object) => object !== null) };
    }

    if (files.length < 1) {
        return {
            errors: [
                {
                    filename: "<unknown>",
                    message: "At least one file is required.",
                },
            ],
        };
    }

    const parsedDataList = files.map((file) => parse(file.content));
    const processedDataList = parsedDataList.map(processParsedData);
    const mergedData = processedDataList.reduce((acc, curr) => {
        acc.objects.push(...curr.objects);
        return acc;
    }, { id: 'entities', name: 'Entities', schema: 'Entity', objects: [] });

    if (FLAGS.assumeUserAccountEntity) {
        mergedData.objects.push(
            {
                name: "UserAccount",
                description: "A registered user of the system",
                masked: true,
                attributes: [
                    {
                        name: "login_name",
                        description: "The login name of the user",
                        type: "basic#String",
                        validation: {
                            name: '_', description: '',
                            isNotEmpty: true, isUnique: true
                        }
                    },
                    {
                        name: "password_hash",
                        description: "The hashed password of the user (BCrypt)",
                        type: "basic#String",
                        masked: true,
                        validation: {
                            name: '_', description: '',
                            isNotEmpty: true
                        }
                    },
                    {
                        name: "display_name",
                        description: "The display name of the user",
                        type: "basic#String",
                        validation: {
                            name: '_', description: '',
                            isNotEmpty: true
                        }
                    },
                ]
            }
        );
    }

    return mergedData;
}

return {
    extensions: ['.entities'],
    parse: parseAllEntitiesFiles,
};
