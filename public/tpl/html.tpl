<div class="col parent-input relative {$form['class']}" {$form['atributos']} style="{$form['style']}">
    <label class="col">
        <span class="col">{$nome} {($default === false) ? "*" : ""}</span>
        <textarea data-model="{$ngmodel}" id="{$ngmodel}" data-format="textarea"
                {($size !== false)? "maxlength='{$size}' " : ''}
                {($default === false)? 'required="required" ' : ''}
                {($disabled)? "disabled='disabled' " : ''}
                  style="height: 142px" class="flow-text padding-small editorHtml hide"
                  placeholder="descrição..." rows="10">{$value}</textarea>
        <span class="input-bar"></span>
    </label>
</div>