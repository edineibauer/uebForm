<div class="parent-input col {$form['class']}" {$form['atributos']} style="max-height: 74px;{$form['style']}">
    <label class="col" style="width: auto">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <div class="switch switch-squad">
            <input type="checkbox" data-model="{$ngmodel}" id="{$ngmodel}" data-format="switch"
                    {($value !== false && $value == 1) ? "checked='checked' " : "" }
                    {($size !== false)? "maxlength='{$size}' " : ''}
                    {($disabled)? "disabled='disabled' " : ''}
                    {($default === false)? 'required="required" ' : ''}
                   class="switchCheck"/>
            <div class="slider"></div>
        </div>
    </label>
</div>