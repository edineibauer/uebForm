<div class="col parent-input relative {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <input type='password' id="{$ngmodel}" data-model="{$ngmodel}" data-format="password"
                {($size !== false)? "maxlength='{$size}' " : ''}
                {($disabled)? "disabled='disabled' " : ''}
                {($default === false)? 'required="required" ' : ''} autocomplete="new-password"/>
        <span class="input-bar"></span>
    </label>
</div>
