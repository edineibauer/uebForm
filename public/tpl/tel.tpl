<div class="col parent-input relative {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <input type="tel" data-model="{$ngmodel}" id="{$ngmodel}" data-format="tel" autocomplete="off"
                {($value != "")? "value='{$value}'" : ''}
                {($size !== false)? "maxlength='{$size}' " : ''}
                {($disabled)? "disabled='disabled' " : ''}
                {($default === false)? 'required="required" ' : ''}
               class="telefone"/>
        <span class="input-bar"></span>
    </label>
</div>