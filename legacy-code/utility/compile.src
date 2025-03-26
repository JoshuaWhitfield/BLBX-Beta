file = get_shell.host_computer.File("/root/compile.txt")
resultFile = get_shell.host_computer.File("/root/result.txt")

toggle = false
result = "" + """"

for ch in file.get_content 
    if ch == """" and not toggle then 
        toggle = true 
        result =  result + ch + "+" + ch 
        continue 
    end if 

	if ch == char(10) then 
		result = result + ";"
		continue
	end if

    if ch == """" and toggle then 
        toggle = false 
        result = result + ch + ".quote+" + """"
        continue 
    end if 

    result = result + ch 
end for 

print "<color=green>complete"
print "<color=white>length: <color=green>" + result.len + "</color> chars"

resultFile.set_content(result+"""")