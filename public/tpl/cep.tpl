<div class="col relative parent-input {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <input type="text" data-model="{$ngmodel}" id="{$ngmodel}" autocomplete="off" data-format="cep"
                {($value != "") ? "value='{$value}' " : "" }
                {($size !== false)? "maxlength='{$size}' " : ''}
                {($disabled)? "disabled='disabled' " : ''}
                {($default === false)? 'required="required" ' : ''}
               class="cep"/>
        <span class="input-bar"></span>
    </label>
</div>
