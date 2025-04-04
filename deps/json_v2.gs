list.reverse = function()
  new_arr = []
  for elem in self 
    new_arr.push(self.pop)
  end for 
  return new_arr
end function 

callable = function(value)
    return typeof(value) == "function";
end function

anonSuccess = function()
  return true
end function

anonFailure = function()
  return true
end function

fif = function(condition, onSuccess = @anonSuccess, onFailure = @anonFailure)
    if callable(condition) then condition = condition();
    
    if condition then 
        if callable(onSuccess) then return onSuccess();
        return onSuccess;
    end if

    if callable(onFailure) then return onFailure();
    return onFailure();
end function

///-- JSON internal dependency
_json = {}

///-- JSON Lexer dependency. tokenizes stringified
///-- input for scaffolding and parsing.

_json.lexer = {}
_json.lexer.TokenTypes = { "Key":"KEY", "Map": "MAP", "List": "LIST", "CloseList": "CLOSELIST", "CloseMap": "CLOSEMAP", "String": "STRING", "Number": "NUMBER", "Null": "NULL" }
_json.lexer.token_output = []
_json.lexer.input = ""
_json.lexer.position = 0 

_json.lexer.wipe = function()
    self.input = ""
    self.position = 0 
    self.token_output = []
end function 

_json.lexer.get_token_output = function()
    return self.token_output
end function 

_json.lexer.set_token_output = function(new_token_output)
    self.token_output = new_token_output 
    return self.token_output 
end function 

_json.lexer.set_input = function(new_input)
    self.input = new_input
    return self.input
end function 

_json.lexer.get_input = function()
    return self.input 
end function 

_json.lexer.consume = function()
    result = self.get_input()[self.position]
    self.set_input(self.get_input()[1:])
    return result
end function

_json.lexer.peek = function()
    if not self.get_input().hasIndex(self.position + 1) then return false 
    return self.get_input()[self.position] 
end function 

_json.lexer.next_token = function()
    // if input is empty end the recursive loop
    // by returning null
    if not self.get_input().len then return null
    
    // matches: "arbitrary_word_in_quotes"
    key_regex = ("""" + "(?:\\.|[^" + """" + "\\])*" + """")

    // consume the next value for tokenization
    value = self.consume()

    if typeof((char(10) + " ,").values.indexOf(value)) == "number" then return self.next_token()
    if value.is_match(key_regex) then 
        if value[-1] == ":" and self.peek() then
            
            //Create Map-Key Token 
            if self.peek().search("{}") then 
                self.consume()
                return [{ "type": self.TokenTypes.Map, "value": value[:-1].values.clean([""""]).join("") }, { "type": self.TokenTypes.CloseMap, "value": "}" }]
            end if 
            //Create List-Key Token
            if self.peek().search("[]") then 
                self.consume()
                return [{ "type": self.TokenTypes.List, "value": value[:-1].values.clean([""""]).join("") }, { "type": self.TokenTypes.CloseList, "value": "]" }]
            end if 
            if self.peek().search("{") then 
                self.consume()
                return { "type": self.TokenTypes.Map, "value": value[:-1].values.clean([""""]).join("") } 
            end if 
            if self.peek().search("[") then 
                self.consume()
                return { "type": self.TokenTypes.List, "value": value[:-1].values.clean([""""]).join("") }
            end if 
            //Create Regular Key Token
            return { "type": self.TokenTypes.Key , "value": value[:-1].values.clean([""""]).join("") }
        end if 
        
        
        //Create String Token
        keyword = value
        return { "type": self.TokenTypes.String, "value": keyword.values.clean(["""", ","]).join("").trim }
    end if 

    if value.search("null") then return { "type": self.TokenTypes.Null, "value": null }

    //Create Number Token
    if value.is_match("\d") then 
        number = value
        return { "type": self.TokenTypes.Number, "value": number.values.clean([",", char(10)]).join("").val }
    end if 

    //Create Literal Array/Map Token
    if value.search("[]") then
        self.consume()
        return [ { "type": _json.lexer.TokenTypes.List, "value": "literal" }, { "type": _json.lexer.TokenTypes.CloseList, "value": "]" } ]
    end if 
    if value.search("{}") then 
        self.consume()
        return [ { "type": _json.lexer.TokenTypes.Map, "value": "literal" }, { "type": _json.lexer.TokenTypes.CloseMap, "value": "}" } ]
    end if 

    if value.search("[") then return { "type": self.TokenTypes.List, "value": "literal" }
    if value.search("{") then return { "type": self.TokenTypes.Map, "value": "literal" }

    //Create Closure Tokens
    if value.search("]") then return { "type": self.TokenTypes.CloseList, "value": "]" }
    if value.search("}") then return { "type": self.TokenTypes.CloseMap, "value" : "}" }
    
    // Skip unrecognized tokens
    return self.next_token()
end function 

// Tokenize the input set previously in runtime with 
// the desired output container passed as a parameter
_json.lexer.tokenize = function(token_output = 0)
    if not token_output then token_output = []
    current_token = self.next_token()
    if typeof(current_token) == "null" then return token_output
    if not typeof(current_token) == "list" then current_token = [current_token]

    for element in current_token 
        token_output.push(element)
    end for 

    return self.tokenize(token_output)
end function

///-- Scaffolding. houses data in a series of nested 
///-- arrays based on whether the token is a map or list.

_json.scaffold = {}
_json.scaffold.output_array = []
_json.scaffold.input = []
_json.scaffold.position = 0

// reset the scaffold output, input, and position
_json.scaffold.wipe = function()
    self.output_array = []
    self.input = []
    self.position = 0
end function 

// get the scaffold input
_json.scaffold.get_input = function()
    return self.input 
end function 

// set the scaffold input
_json.scaffold.set_input = function(new_input)
    self.input = new_input 
    return self.input 
end function

// parse all tokens in scaffold input into 
// the scaffold nested array structure
_json.scaffold.parse = function(output_array = 0, stack = 0)
    if not output_array then output_array = []
    if not stack then stack = []

    for token in self.get_input() 
        if typeof([_json.lexer.TokenTypes.Map, _json.lexer.TokenTypes.List].indexOf(token.type)) == "number" then 
            output_array.push(token)
            new_structure = []
            output_array.push(new_structure)
            stack.push(output_array)
            output_array = new_structure 
            continue
        end if 

        if typeof([_json.lexer.TokenTypes.CloseMap, _json.lexer.TokenTypes.CloseList].indexOf(token.type)) == "number" then
            output_array.push(token)
            output_array = stack.pop()
            continue 
        end if 

        output_array.push(token)
    end for

    return output_array  
end function 

///-- JSON Parser 

_json.parser = {}
_json.parser.object_output = {}
_json.parser.position = 0
_json.parser.input = []
_json.parser.is_list = false 
_json.parser.is_map = false 

// get parser input array 
_json.parser.get_input = function()
    return self.input
end function 

// set parser input array 
_json.parser.set_input = function(new_input)
    self.input = new_input 
    return self.input 
end function

// peek at next element in parser input 
_json.parser.peek = function(input_array)
    if not input_array.hasIndex(self.position + 1) then return false 
    return input_array[self.position + 1]
end function 

_json.parser.consume = function()
    if not self.get_input().len then return false 
    result = self.get_input[0]
    self.set_input(self.get_input()[1:])
    return result 
end function 

// parse list represented by a nested 
// array into object form and return it
_json.parser.parse_list = function(input_array, output_arr = 0)
    if not output_arr then output_arr = []  
    index = -1
    skip = false 
    for element in input_array 
        if skip then ;skip = false;continue;end if 
        index = index + 1  
        if element.type == _json.lexer.TokenTypes.Map then 
            output_arr.push(self.parse(input_array[index + 1]))
            skip = true
            continue
        end if 
        if element.type == _json.lexer.TokenTypes.List then 
            offset = 1
            next_iter_array = input_array[index + offset]
            while typeof(next_iter_array) != "list" 
                offset = offset + 1
                next_iter_array = input_array[index + offset]
            end while 
            output_arr.push(self.parse_list(next_iter_array))
            skip = true 
            continue 
        end if 
        if typeof([_json.lexer.TokenTypes.List, _json.lexer.TokenTypes.Map, _json.lexer.TokenTypes.CloseList, _json.lexer.TokenTypes.CloseMap].indexOf(element.type)) == "number" then continue
        output_arr.push(element.value)
    end for 
    return output_arr
end function 

// parse parser input from scaffold into object form
// and recursively handle arrays and maps
_json.parser.parse = function(input_array, object_output = 0)
    if not object_output then object_output = {}

    skip = false
    index = -1
    
    for token in input_array 
        index = index + 1
        if skip then 
            skip = false 
            continue 
        end if 

        if token.type == _json.lexer.TokenTypes.Map then 
            object_output[token.value] = self.parse(input_array[index + 1])
            skip = true
            continue
        end if 

        if token.type == _json.lexer.TokenTypes.List then 
            object_output[token.value] = self.parse_list(input_array[index + 1])
            skip = true
            continue
        end if 

        if token.type == _json.lexer.TokenTypes.Key then 
            object_output[token.value] = input_array[index + 1].value
            skip = true 
            continue
        end if 
    end for 

    return object_output
end function

///-- JSON eternal library
JSON = {}

// JSON inherit internal dependencies
JSON.internal = _json

// JSON write
JSON.write = function(map_object = {}, indentation = 2, jump = 2)
    if not typeof(["map", "list"].indexOf(typeof(map_object))) == "number" then return false 
    if not map_object.len and typeof(map_object) == "map" then return "{}"
    if not map_object.len and typeof(map_object) == "list" then return "[]"
    
    open_bracket = fif(typeof(map_object) == "map", "{", "[")
    closed_bracket = fif(typeof(map_object) == "map", "}", "]")
    space = " " * indentation
    result = open_bracket

    if typeof(map_object) == "list" then 
        for element in map_object 
            if typeof(element) == "map" then 
                result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + self.write(element, (indentation + jump))
                continue 
            end if 
            if typeof(element) == "list" then 
                result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + self.write(element, (indentation + jump))
                continue 
            end if 
            if typeof(element) == "string" then 
                result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + element.quote
                continue 
            end if 
            if typeof(element) == "number" then 
                result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + element
                continue 
            end if
            if typeof(element) == "null" then 
                result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + "Null"
                continue 
            end if
        end for 
        result = result + char(10) + (" " * (indentation - jump)) + "],"
        return result
    end if 

    for element in map_object
        key = element.key 
        value = element.value 
        if typeof(value) == "map" then 
            result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + key.quote + ": " + self.write(value, (indentation + jump))
            continue 
        end if 
        if typeof(value) == "list" then 
            result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + key.quote + ": " + self.write(value, (indentation + jump))
            continue 
        end if 
        if typeof(value) == "string" then
            result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + key.quote + ": " + value.quote
            continue 
        end if 
        if typeof(value) == "null" then 
            result = result + fif(result.len == 1, char(10), (", " + char(10))) + space + key.quote + ": Null"
            continue 
        end if 
    end for 

    result = result + char(10) + (" " * (indentation - jump)) + "}"

    return result 
end function 

// JSON parse
JSON.read = function(serialized_object = "{" + char(10) + "}") 
    if typeof(["{" + char(10) + "}", "{}"].indexOf(serialized_object)) == "number" then return {}
    self.internal.lexer.set_input(serialized_object.split(" ").clean([""]))
    tokens = self.internal.lexer.tokenize()
    self.internal.scaffold.set_input(tokens[1:])
    scaffold = self.internal.scaffold.parse(self.internal.scaffold.output_array)
    self.internal.parser.set_input(scaffold)
    return self.internal.parser.parse(scaffold) 
end function 


