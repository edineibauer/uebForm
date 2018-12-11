<div class="col parent-input relative {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <input type="date" id="{$ngmodel}" data-model="{$ngmodel}" data-format="date"
                {($value != "") ? "value='{$value}' " : "" }
                {($disabled)? "disabled='disabled' " : ''}
                {($default === false)? 'required="required" ' : ''} />
        <span class="input-bar"></span>
    </label>
</div>
