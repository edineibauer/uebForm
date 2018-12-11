<div class="col parent-input relative {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <input type="text" data-model="{$ngmodel}" autocomplete="off" class="valor" placeholder="R$" id="{$ngmodel}"
               data-format="valor"
                {($value != "")? "value='{$value}'" : ''}
                {($size !== false)? "maxlength='{$size}' " : ''}
                {($disabled)? "disabled='disabled' " : ''}
                {($default === false)? 'required="required" ' : ''} />
        <span class="input-bar"></span>
    </label>
</div>